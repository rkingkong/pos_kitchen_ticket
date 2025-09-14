/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { onMounted, onPatched } from "@odoo/owl";

function injectKotBeforeValidate(clickHandler) {
    const validate = document.querySelector(".payment-screen .button.next.validation");
    if (!validate) return false;
    const parent = validate.parentNode;
    if (!parent) return false;

    if (!parent.querySelector(".button.kot-print")) {
        const kot = document.createElement("div");
        kot.className =
            "button kot-print btn btn-outline-secondary btn-lg py-5 rounded-0 " +
            "d-flex flex-column align-items-center justify-content-center fw-bolder";
        kot.innerHTML =
            '<div class="pay-circle d-flex align-items-center justify-content-center mb-2">' +
            '<i class="fa fa-print" aria-hidden="true"></i>' +
            "</div><span>Imprimir comanda</span>";
        kot.addEventListener("click", clickHandler);
        parent.insertBefore(kot, validate);
        console.log("[pos_kitchen_ticket] Botón de comanda insertado ✔");
    }
    return true;
}

patch(PaymentScreen.prototype, "pos_kitchen_ticket.PaymentScreenPatch", {
    setup() {
        super.setup();
        this.pos = this.pos || usePos();
        console.log("[pos_kitchen_ticket] PaymentScreen patch loaded ✅");

        const tryInject = () => injectKotBeforeValidate(this.onClickPrintKitchen.bind(this));
        onMounted(tryInject);
        onPatched(tryInject);
        setTimeout(tryInject, 200);
        setTimeout(tryInject, 800);
    },

    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) return;
            const html = this.env.qweb.render("pos_kitchen.KitchenTicket", { order, pos: this.pos });
            const w = window.open("", "KOT", "width=480,height=800,scrollbars=yes");
            w.document.open(); w.document.write(html); w.document.close(); w.focus();
        } catch (e) {
            console.error("Error al imprimir comanda:", e);
            alert("No se pudo imprimir la comanda. Revisa la consola del navegador.");
        }
    },
});
