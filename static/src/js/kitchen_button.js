/** @odoo-module **/

console.log("🎯 Kitchen Button JS - Starting load...");

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";

console.log("✅ Imports completed successfully");
console.log("PaymentScreen available:", !!PaymentScreen);

// Add button directly to the template
patch(PaymentScreen.prototype, {
    setup() {
        console.log("🔧 PaymentScreen.setup() - Starting patch");
        super.setup();
        
        console.log("POS instance:", this.pos);
        console.log("Services available:", Object.keys(this.env.services));
        
        try {
            this.printer = useService("printer");
            console.log("✅ Printer service loaded");
        } catch (e) {
            console.error("❌ Failed to load printer service:", e);
        }
        
        try {
            this.popup = useService("popup");
            console.log("✅ Popup service loaded");
        } catch (e) {
            console.error("❌ Failed to load popup service:", e);
        }
        
        console.log("✅ PaymentScreen patch setup complete");
    },
    
    onMounted() {
        super.onMounted();
        console.log("🎨 PaymentScreen mounted - Adding button");
        this.addKitchenButton();
    },
    
    addKitchenButton() {
        console.log("🔨 Attempting to add kitchen button...");
        
        // Try multiple selectors
        const selectors = [
            '.payment-buttons',
            '.button-group',
            '.payment-screen .controls',
            '.payment-controls-container',
            '.next-button-container'
        ];
        
        let buttonContainer = null;
        for (const selector of selectors) {
            buttonContainer = this.el.querySelector(selector);
            if (buttonContainer) {
                console.log(`✅ Found container with selector: ${selector}`);
                break;
            }
        }
        
        if (!buttonContainer) {
            console.error("❌ No button container found!");
            console.log("Available elements:", this.el.innerHTML.substring(0, 500));
            return;
        }
        
        // Check if button already exists
        if (buttonContainer.querySelector('.kitchen-print-button')) {
            console.log("⚠️ Kitchen button already exists");
            return;
        }
        
        // Create button
        const kitchenButton = document.createElement('button');
        kitchenButton.className = 'button btn btn-secondary kitchen-print-button';
        kitchenButton.innerHTML = '<i class="fa fa-cutlery"></i> Imprimir Comanda';
        kitchenButton.onclick = () => this.onClickPrintKitchen();
        
        buttonContainer.appendChild(kitchenButton);
        console.log("✅ Kitchen button added successfully!");
    },

    async onClickPrintKitchen() {
        console.log("🖨️ Kitchen print button clicked!");
        
        try {
            const order = this.pos.get_order();
            console.log("Current order:", order);
            
            if (!order) {
                console.error("❌ No active order found");
                if (this.popup) {
                    await this.popup.add("ErrorPopup", {
                        title: _t("Error"),
                        body: _t("No hay orden activa"),
                    });
                } else {
                    alert("No hay orden activa");
                }
                return;
            }
            
            console.log("Order details:", {
                name: order.name,
                uid: order.uid,
                lines: order.get_orderlines().length,
                total: order.get_total_with_tax()
            });
            
            // Try to print
            const receiptData = this.getKitchenReceiptData(order);
            console.log("Receipt data prepared:", receiptData);
            
            // Simple fallback print
            this.simplePrint(receiptData);
            
            console.log("✅ Kitchen ticket processed");
            
        } catch (error) {
            console.error("❌ Error in onClickPrintKitchen:", error);
            alert("Error: " + error.message);
        }
    },
    
    simplePrint(data) {
        console.log("📄 Opening print window...");
        
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comanda de Cocina</title>
                <style>
                    body { font-family: monospace; margin: 20px; }
                    h2 { text-align: center; }
                    .info { margin: 10px 0; }
                    .lines { width: 100%; margin: 20px 0; }
                    .lines td { padding: 5px; }
                    .qty { text-align: right; font-weight: bold; width: 50px; }
                </style>
            </head>
            <body>
                <h2>COMANDA DE COCINA</h2>
                <div class="info">
                    <div>Orden: ${data.order_name}</div>
                    <div>Fecha: ${data.date}</div>
                    ${data.table ? `<div>Mesa: ${data.table}</div>` : ''}
                    <div>Cajero: ${data.cashier}</div>
                    ${data.customer ? `<div>Cliente: ${data.customer}</div>` : ''}
                </div>
                <hr>
                <table class="lines">
                    ${data.lines.map(line => `
                        <tr>
                            <td class="qty">${line.quantity}</td>
                            <td>${line.product_name}</td>
                        </tr>
                        ${line.note ? `<tr><td></td><td style="font-style: italic;">Nota: ${line.note}</td></tr>` : ''}
                    `).join('')}
                </table>
                ${data.order_note ? `<div>Observaciones: ${data.order_note}</div>` : ''}
                <hr>
                <div style="text-align: center;">FIN DE COMANDA</div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        console.log("✅ Print window opened");
    },
    
    getKitchenReceiptData(order) {
        console.log("📋 Preparing kitchen receipt data...");
        
        const orderlines = order.get_orderlines();
        const kitchenLines = [];
        
        for (const line of orderlines) {
            const lineData = {
                quantity: line.get_quantity(),
                unit: line.get_unit ? line.get_unit()?.name : "",
                product_name: line.get_full_product_name ? line.get_full_product_name() : line.product.display_name,
                note: line.get_customer_note ? line.get_customer_note() : "",
            };
            console.log("Line data:", lineData);
            kitchenLines.push(lineData);
        }
        
        const receiptData = {
            order_name: order.name || order.uid || "S/N",
            table: order.table ? order.table.name : "",
            cashier: this.pos.get_cashier ? this.pos.get_cashier().name : "Usuario",
            date: new Date().toLocaleString('es-GT'),
            customer: order.get_partner ? (order.get_partner()?.name || "Consumidor Final") : "CF",
            lines: kitchenLines,
            order_note: order.get_note ? order.get_note() : "",
        };
        
        console.log("✅ Receipt data complete:", receiptData);
        return receiptData;
    }
});

console.log("✅ Kitchen Button module fully loaded!");
