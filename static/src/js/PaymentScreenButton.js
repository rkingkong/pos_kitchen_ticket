/** @odoo-module **/

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { onMounted } from "@odoo/owl";

console.log("Kitchen Module Starting...");

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        console.log("PaymentScreen patch applied");
        
        onMounted(() => {
            this.addKitchenButton();
        });
    },
    
    addKitchenButton() {
        console.log("Adding kitchen button...");
        
        // Wait a bit for DOM
        setTimeout(() => {
            // Find the payment buttons container
            const container = this.el.querySelector('.payment-buttons');
            if (!container) {
                console.error("Payment buttons container not found");
                return;
            }
            
            // Check if button already exists
            if (container.querySelector('.kitchen-ticket-btn')) {
                console.log("Kitchen button already exists");
                return;
            }
            
            // Find Validar button
            const validarBtn = container.querySelector('div.button-next-validation') || 
                              Array.from(container.querySelectorAll('*')).find(
                                  el => el.textContent.includes('Validar')
                              );
            
            // Create kitchen button
            const kitchenBtn = document.createElement('div');
            kitchenBtn.className = 'button kitchen-ticket-btn';
            kitchenBtn.style.cssText = `
                background-color: #ff6b35;
                color: white;
                margin: 5px;
                padding: 15px;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            kitchenBtn.innerHTML = '🍴 Comanda Cocina';
            
            // Add click handler
            kitchenBtn.addEventListener('click', () => this.printKitchenTicket());
            
            // Insert before Validar if found, otherwise append
            if (validarBtn) {
                validarBtn.parentElement.insertBefore(kitchenBtn, validarBtn);
            } else {
                container.appendChild(kitchenBtn);
            }
            
            console.log("✅ Kitchen button added successfully!");
        }, 100);
    },
    
    printKitchenTicket() {
        console.log("Printing kitchen ticket...");
        const order = this.pos.get_order();
        
        if (!order) {
            alert("No hay orden activa");
            return;
        }
        
        const orderlines = order.get_orderlines();
        if (orderlines.length === 0) {
            alert("No hay productos en la orden");
            return;
        }
        
        // Build HTML for print
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Comanda de Cocina</title>
                <style>
                    * { margin: 0; padding: 0; }
                    body { 
                        font-family: monospace; 
                        padding: 10px;
                        width: 280px;
                    }
                    h2 { 
                        text-align: center; 
                        margin: 10px 0;
                        font-size: 18px;
                    }
                    .info { 
                        margin: 10px 0;
                        font-size: 12px;
                    }
                    .line {
                        display: flex;
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .qty {
                        width: 50px;
                        text-align: right;
                        font-weight: bold;
                    }
                    .product {
                        flex: 1;
                        padding-left: 10px;
                    }
                    hr {
                        border: none;
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body onload="window.print(); setTimeout(() => window.close(), 500);">
                <h2>COMANDA DE COCINA</h2>
                <hr>
                <div class="info">
                    <div>Orden: ${order.name || order.uid}</div>
                    <div>Fecha: ${new Date().toLocaleString('es-GT')}</div>
                    <div>Cajero: ${this.pos.get_cashier().name}</div>
                </div>
                <hr>
        `;
        
        // Add order lines
        for (const line of orderlines) {
            const qty = line.get_quantity();
            const product = line.get_product();
            html += `
                <div class="line">
                    <div class="qty">${qty}</div>
                    <div class="product">${product.display_name}</div>
                </div>
            `;
        }
        
        html += `
                <hr>
                <div class="footer">*** FIN DE COMANDA ***</div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
    }
});

console.log("✅ Kitchen Module Loaded!");
