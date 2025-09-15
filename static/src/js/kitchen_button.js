/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.printer = useService("printer");
        this.popup = useService("popup");
    },

    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) {
                await this.popup.add("ErrorPopup", {
                    title: _t("Error"),
                    body: _t("No hay orden activa"),
                });
                return;
            }

            // Prepare receipt data for kitchen
            const receiptData = this.getKitchenReceiptData(order);
            
            // Print using the POS printer service
            const isPrinted = await this.printer.print(
                "pos_kitchen_ticket.KitchenReceipt",
                receiptData,
                { webPrintFallback: true }
            );

            if (isPrinted) {
                await this.popup.add("SuccessPopup", {
                    title: _t("Éxito"),
                    body: _t("Comanda enviada a la cocina"),
                });
            }
        } catch (error) {
            console.error("Error printing kitchen ticket:", error);
            await this.popup.add("ErrorPopup", {
                title: _t("Error de Impresión"),
                body: _t("No se pudo imprimir la comanda. Por favor, intente de nuevo."),
            });
        }
    },

    getKitchenReceiptData(order) {
        const orderlines = order.get_orderlines();
        const kitchenLines = [];
        
        for (const line of orderlines) {
            kitchenLines.push({
                quantity: line.get_quantity(),
                unit: line.get_unit() ? line.get_unit().name : "",
                product_name: line.get_full_product_name(),
                note: line.get_customer_note() || "",
            });
        }

        return {
            order_name: order.name || order.uid,
            table: order.table ? order.table.name : "",
            cashier: this.pos.get_cashier().name,
            date: new Date().toLocaleString('es-GT'),
            customer: order.get_partner() ? order.get_partner().name : "Consumidor Final",
            lines: kitchenLines,
            order_note: order.get_note() || "",
        };
    },
});
