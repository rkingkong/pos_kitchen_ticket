/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { onMounted, onPatched } from "@odoo/owl";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.pos = this.pos || usePos();
        console.log("[pos_kitchen_ticket] PaymentScreen patch loaded ✅");

        const injectButton = () => {
            // 1) Buscamos el botón "Validar" EXACTAMENTE como sale en tu HTML
            const screen = document.querySelector(".payment-screen");
            if (!screen) return;

            const mainContent = screen.querySelector(".main-content");
            const nextBtn = mainContent && mainContent.querySelector(".button.next.validation");
            if (!mainContent || !nextBtn) return;

            // 2) Si aún no existe nuestro botón, lo insertamos ANTES de "Validar"
            if (!mainContent.querySelector(".button.kot-print")) {
                // Usamos un DIV para mantener el mismo look&feel que el "Validar"
                const kot = document.createElement("div");
                kot.className =
                    "button kot-print btn btn-outline-secondary btn-lg py-5 rounded-0 " +
                    "d-flex flex-column align-items-center justify-content-center fw-bolder";
                kot.innerHTML =
                    '<div class="pay-circle d-flex align-items-center justify-content-center mb-2">' +
                    '<i class="fa fa-print" aria-hidden="true"></i>' +
                    "</div><span>Imprimir comanda</span>";

                kot.addEventListener("click", this.onClickPrintKitchen.bind(this));

                mainContent.insertBefore(kot, nextBtn);
                console.log("[pos_kitchen_ticket] Botón de comanda insertado ✔");
            }
        };

        // Insertar al montar y cada vez que se re-renderiza la pantalla
        onMounted(injectButton);
        onPatched(injectButton);
    },

    async onClickPrintKitchen() {
        try {
            const order = this.pos.get_order();
            if (!order) return;

            // QWeb template definido en static/src/xml/kitchen_templates.xml (no tocar)
            const html = this.env.qweb.render("pos_kitchen.KitchenTicket", {
                order,
                pos: this.pos,
            });

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
