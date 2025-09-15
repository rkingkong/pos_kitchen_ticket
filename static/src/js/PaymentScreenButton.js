/** @odoo-module */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.printer = useService("printer");
        this.popup = useService("popup");
        console.log("✅ Kitchen Ticket module initialized in PaymentScreen");
    },

    async printKitchenTicket() {
        console.log("🍴 Kitchen ticket button clicked!");
        
        const order = this.pos.get_order();
        
        if (!order || order.get_orderlines().length === 0) {
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No hay productos en la orden"),
            });
            return;
        }

        try {
            // Prepare kitchen ticket data
            const kitchenData = this._prepareKitchenData(order);
            
            // Try hardware printer first
            const isPrinted = await this.printer.print(
                'pos_kitchen_ticket.KitchenReceipt',
                kitchenData,
                { 
                    webPrintFallback: true,
                    cashbox: false 
                }
            );
            
            if (!isPrinted) {
                // Fallback to browser print
                this._browserPrintKitchen(kitchenData);
            }
            
            // Show confirmation
            await this.popup.add(ConfirmPopup, {
                title: _t("Comanda Enviada"),
                body: _t("La comanda fue enviada a la cocina exitosamente"),
                confirmText: _t("OK"),
                cancelText: "",
            });
            
        } catch (error) {
            console.error("Error printing kitchen ticket:", error);
            await this.popup.add(ErrorPopup, {
                title: _t("Error de Impresión"),
                body: _t("No se pudo imprimir la comanda: ") + error.message,
            });
        }
    },

    _prepareKitchenData(order) {
        const orderlines = order.get_orderlines();
        const lines = [];
        
        for (const line of orderlines) {
            lines.push({
                qty: line.get_quantity(),
                unit: line.get_unit()?.name || '',
                product_name: line.get_full_product_name(),
                note: line.customer_note || '',
            });
        }
        
        return {
            order: {
                name: order.name || order.uid,
                date: new Date().toLocaleString('es-GT'),
                table: order.table?.name || '',
                customer: order.get_partner()?.name || 'Consumidor Final',
                cashier: this.pos.get_cashier()?.name || 'Usuario',
                note: order.get_note() || '',
            },
            lines: lines,
            company: this.pos.company,
        };
    },

    _browserPrintKitchen(data) {
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Comanda de Cocina</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 10px;
                        width: 300px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 10px;
                        padding-bottom: 5px;
                        border-bottom: 2px dashed #000;
                    }
                    .header h2 {
                        font-size: 18px;
                        margin: 5px 0;
                    }
                    .info {
                        margin: 10px 0;
                        font-size: 12px;
                    }
                    .info div {
                        margin: 3px 0;
                    }
                    .lines {
                        margin: 15px 0;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                        padding: 10px 0;
                    }
                    .line {
                        display: flex;
                        margin: 5px 0;
                    }
                    .line .qty {
                        width: 50px;
                        text-align: right;
                        font-weight: bold;
                        font-size: 16px;
                    }
                    .line .product {
                        flex: 1;
                        padding-left: 10px;
                        font-size: 14px;
                    }
                    .line-note {
                        padding-left: 60px;
                        font-style: italic;
                        font-size: 11px;
                        color: #333;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 10px;
                    }
                </style>
            </head>
            <body onload="window.print(); setTimeout(() => window.close(), 100);">
                <div class="header">
                    <h2>COMANDA DE COCINA</h2>
                    <div>${data.company.name}</div>
                </div>
                
                <div class="info">
                    <div><strong>Orden:</strong> ${data.order.name}</div>
                    <div><strong>Fecha:</strong> ${data.order.date}</div>
                    ${data.order.table ? `<div><strong>Mesa:</strong> ${data.order.table}</div>` : ''}
                    <div><strong>Mesero:</strong> ${data.order.cashier}</div>
                    <div><strong>Cliente:</strong> ${data.order.customer}</div>
                </div>
                
                <div class="lines">
                    ${data.lines.map(line => `
                        <div class="line">
                            <div class="qty">${line.qty}</div>
                            <div class="product">${line.product_name}</div>
                        </div>
                        ${line.note ? `<div class="line-note">Nota: ${line.note}</div>` : ''}
                    `).join('')}
                </div>
                
                ${data.order.note ? `
                    <div class="info">
                        <strong>Observaciones:</strong><br>
                        ${data.order.note}
                    </div>
                ` : ''}
                
                <div class="footer">
                    *** FIN DE COMANDA ***
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }
});
