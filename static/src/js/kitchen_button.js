/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        // Store del POS
        this.pos = this.pos || usePos();
    },

    /**
     * Renderiza una comanda simple en HTML y abre la impresión del navegador.
     */
    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) {
                return;
            }
            // Render QWeb template a string
            const html = this.env.qweb.render("pos_kitchen.KitchenTicket", {
                order,
                pos: this.pos,
            });

            // Abre una ventana liviana para imprimir
            const w = window.open("", "KOT", "width=480,height=800,scrollbars=yes");
            w.document.open();
            w.document.write(html);
            w.document.close();
            w.focus();
            // La propia plantilla dispara window.print() con pequeño timeout
        } catch (e) {
            console.error("Error al imprimir comanda:", e);
            alert("No se pudo imprimir la comanda. Revisa la consola del navegador.");
        }
    },
});
