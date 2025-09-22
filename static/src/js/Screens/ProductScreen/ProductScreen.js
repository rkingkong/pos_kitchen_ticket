/** @odoo-module **/

import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { patch } from "@web/core/utils/patch";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { TextAreaPopup } from "@point_of_sale/app/utils/input_popups/textarea_popup";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.notification = useService("notification");
        this.popup = useService("popup");
    },

    async onClickOrderType() {
        const order = this.pos.get_order();
        
        const selectionList = [
            { id: 'comer_aqui', label: 'Para Comer Aquí', item: 'comer_aqui' },
            { id: 'para_llevar', label: 'Para Llevar', item: 'para_llevar' },
            { id: 'domicilio', label: 'A Domicilio', item: 'domicilio' }
        ];

        const { confirmed, payload } = await this.popup.add(SelectionPopup, {
            title: _t('Seleccionar Tipo de Orden'),
            list: selectionList,
        });

        if (confirmed) {
            order.order_type_kitchen = payload;
            this.render(true);
            
            // Notify change
            this.notification.add(
                _t(`Tipo de orden: ${selectionList.find(s => s.id === payload).label}`), 
                { type: 'info' }
            );
        }
    },

    async onClickSpecialInstructions() {
        const order = this.pos.get_order();
        
        const { confirmed, payload } = await this.popup.add(TextAreaPopup, {
            title: _t('Instrucciones Especiales'),
            startingValue: order.special_instructions || '',
            placeholder: _t('Ej: Sin cebolla, extra picante, etc.'),
        });

        if (confirmed) {
            order.special_instructions = payload;
            
            this.notification.add(
                _t('Instrucciones especiales agregadas'), 
                { type: 'success' }
            );
        }
    },

    async onClickQuickKitchenPrint() {
        // Quick print from product screen
        const order = this.pos.get_order();
        
        if (!order || order.get_orderlines().length === 0) {
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No hay productos en la orden"),
            });
            return;
        }

        try {
            // Call the print function from PaymentScreen
            const paymentScreen = this.pos.screens?.payment;
            if (paymentScreen && paymentScreen.onClickPrintKitchen) {
                await paymentScreen.onClickPrintKitchen.call({ 
                    ...paymentScreen, 
                    pos: this.pos,
                    popup: this.popup,
                    notification: this.notification
                });
            } else {
                // Direct print if payment screen not available
                this.notification.add(_t("Función de impresión no disponible"), {
                    type: 'warning'
                });
            }
        } catch (error) {
            console.error("Error en impresión rápida:", error);
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No se pudo imprimir la comanda"),
            });
        }
    }
});
