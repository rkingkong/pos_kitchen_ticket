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
            // 1) Buscamos el contenedor de botones dentro de la PaymentScreen
            const nextBtn = document.querySelector(".payment-buttons button.next, button.next");
            const container =
                document.querySelector(".payment-buttons") ||
                (nextBtn ? nextBtn.parentElement : null);

            // 2) Si tenemos contenedor y aún no existe nuestro botón, lo creamos
            if (container && !container.querySelector(".kot-print")) {
                const btn = document.createElement("button");
                btn.className = "button oe_highlight kot-print";
                btn.style.marginRight = "8px";
                btn.textContent = "🧾 Imprimir comanda";
                btn.addEventListener("click", this.onClickPrintKitchen.bind(this));

                if (nextBtn && nextBtn.parentElement === container) {
                    container.insertBefore(btn, nextBtn); // antes de Validar
                } else {
                    container.appendChild(btn); // como fallback
                }
                console.log("[pos_kitchen_ticket] Botón de comanda insertado ✔");
            }
        };

        // Insertamos en montaje y cada vez que la pantalla se repinta
        onMounted(injectButton);
        onPatched(injectButton);
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
