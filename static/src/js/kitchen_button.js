/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.pos = this.pos || usePos();
        console.log("[pos_kitchen_ticket] PaymentScreen patch loaded ✅");
    },

    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) return;

            const html = this.env.qweb.render("pos_kitchen.KitchenTicket", { order, pos: this.pos });
            const w = window.open("", "KOT", "width=480,height=800,scrollbars=yes");
            w.document.open();
            w.document.write(html);
            w.document.close();
            w.focus();
        } catch (e) {
            console.error("Error al imprimir comanda:", e);
            alert("No se pudo imprimir la comanda. Revisa la consola del navegador.");
        }
    },
});
