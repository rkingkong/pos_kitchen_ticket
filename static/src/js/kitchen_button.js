/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { onMounted, onPatched } from "@odoo/owl";

function injectKotButton(handler) {
    // 1) Encontrar el contenedor y el botón Validar según TU HTML
    const screen = document.querySelector(".payment-screen");
    if (!screen) return false;

    const main = screen.querySelector(".main-content");
    const validateBtn = main && main.querySelector(".button.next.validation");
    if (!main || !validateBtn) return false;

    // 2) Si aún no existe nuestro botón, créalo y colócalo antes de Validar
    if (!main.querySelector(".button.kot-print")) {
        const kot = document.createElement("div");
        kot.className =
            "button kot-print btn btn-outline-secondary btn-lg py-5 rounded-0 " +
            "d-flex flex-column align-items-center justify-content-center fw-bolder";
        kot.innerHTML =
            '<div class="pay-circle d-flex align-items-center justify-content-center mb-2">' +
            '<i class="fa fa-print" aria-hidden="true"></i>' +
            "</div><span>Imprimir comanda</span>";
        kot.addEventListener("click", handler);

        // insertar justo antes de Validar
        validateBtn.parentNode.insertBefore(kot, validateBtn);
        console.log("[pos_kitchen_ticket] Botón de comanda insertado ✔");
    }
    return true;
}

patch(PaymentScreen.prototype, "pos_kitchen_ticket.PaymentScreenPatch", {
    setup() {
        super.setup();
        this.pos = this.pos || usePos();
        console.log("[pos_kitchen_ticket] PaymentScreen patch loaded ✅");

        const tryInject = () => injectKotButton(this.onClickPrintKitchen.bind(this));

        // Insertamos en montaje y cada vez que el DOM de la pantalla cambie
        onMounted(tryInject);
        onPatched(tryInject);

        // Fallback defensivo por si el DOM aún no está listo al montar
        setTimeout(tryInject, 300);
        setTimeout(tryInject, 1000);
    },

    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) return;

            // Render QWeb de la plantilla (asegúrate de que está en assets del POS)
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
