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
        
        setTimeout(() => {
            const validarBtn = Array.from(document.querySelectorAll('*')).find(
                el => el.textContent.trim() === 'Validar'
            );
            
            if (validarBtn) {
                // Check if button already exists
                if (document.querySelector('.comanda-test-btn')) {
                    return;
                }
                
                // Create kitchen button
                const kitchenBtn = document.createElement('button');
                kitchenBtn.className = 'comanda-test-btn';
                kitchenBtn.style.cssText = `
                    background: #ff6b35;
                    color: white;
                    padding: 15px 30px;
                    margin: 10px;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                `;
                kitchenBtn.innerHTML = '🍴 COMANDA COCINA';
                
                // Use iframe printing instead of window.open
                kitchenBtn.onclick = () => this.printKitchenTicket();
                
                validarBtn.parentElement.insertBefore(kitchenBtn, validarBtn);
                console.log("✅ Kitchen button added!");
            }
        }, 1000);
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
        
        // Create content
        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                    body { 
                        font-family: monospace; 
                        width: 280px;
                        margin: 0 auto;
                        padding: 10px;
                    }
                    h2 { text-align: center; font-size: 18px; }
                    .info { font-size: 12px; margin: 10px 0; }
                    .line { margin: 5px 0; font-size: 14px; }
                    .qty { display: inline-block; width: 50px; text-align: right; font-weight: bold; }
                    hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h2>COMANDA DE COCINA</h2>
                <hr>
                <div class="info">
                    <div>Orden: ${order.name || order.uid || 'N/A'}</div>
                    <div>Fecha: ${new Date().toLocaleString('es-GT')}</div>
                    <div>Cajero: ${this.pos.get_cashier()?.name || 'Usuario'}</div>
                </div>
                <hr>
        `;
        
        // Add lines
        for (const line of orderlines) {
            const qty = line.get_quantity();
            const product = line.get_product();
            content += `
                <div class="line">
                    <span class="qty">${qty}</span>
                    <span>${product.display_name}</span>
                </div>
            `;
        }
        
        content += `
                <hr>
                <div style="text-align: center;">*** FIN DE COMANDA ***</div>
            </body>
            </html>
        `;
        
        // Method 1: Create hidden iframe and print
        this.printViaIframe(content);
        
        // Method 2: Also create a visible preview
        this.showPrintPreview(content);
    },
    
    printViaIframe(content) {
        // Remove old iframe if exists
        const oldFrame = document.getElementById('kitchen-print-frame');
        if (oldFrame) {
            oldFrame.remove();
        }
        
        // Create hidden iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'kitchen-print-frame';
        iframe.style.cssText = 'position: absolute; width: 0; height: 0; border: 0;';
        document.body.appendChild(iframe);
        
        // Write content and print
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
        
        // Wait for content to load then print
        iframe.contentWindow.focus();
        setTimeout(() => {
            try {
                iframe.contentWindow.print();
            } catch (e) {
                console.error("Print failed:", e);
                alert("No se pudo imprimir. Ver vista previa en pantalla.");
            }
        }, 250);
    },
    
    showPrintPreview(content) {
        // Create preview modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #333;
            padding: 20px;
            z-index: 10000;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        
        modal.innerHTML = `
            <div style="text-align: right; margin-bottom: 10px;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                    ✖ Cerrar
                </button>
            </div>
            <div>${content}</div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" 
                        style="background: green; color: white; border: none; padding: 10px 20px; cursor: pointer;">
                    🖨️ Imprimir
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }
});

console.log("✅ Kitchen Module Loaded!");
