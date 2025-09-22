/** @odoo-module **/

import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { patch } from "@web/core/utils/patch";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { _t } from "@web/core/l10n/translation";

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
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
            order.order_type = payload;
            this.render(true);
            
            // Notificar cambio
            this.notification.add(
                _t(`Tipo de orden: ${selectionList.find(s => s.id === payload).label}`), 
                { type: 'info', sticky: false, timeout: 2000 }
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
                { type: 'success', sticky: false, timeout: 2000 }
            );
        }
    },

    async onClickQuickKitchenPrint() {
        // Impresión rápida desde la pantalla de productos
        const order = this.pos.get_order();
        
        if (!order || order.get_orderlines().length === 0) {
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No hay productos en la orden"),
            });
            return;
        }

        try {
            // Llamar a la función de impresión del PaymentScreen
            const paymentScreen = this.pos.screens.payment;
            if (paymentScreen && paymentScreen.onClickPrintKitchen) {
                await paymentScreen.onClickPrintKitchen.call({ 
                    ...paymentScreen, 
                    pos: this.pos,
                    popup: this.popup,
                    notification: this.notification
                });
            }
        } catch (error) {
            console.error("Error en impresión rápida:", error);
        }
    }
});
