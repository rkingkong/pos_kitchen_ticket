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
            
            if (validarBtn && !document.querySelector('.comanda-cocina-btn')) {
                const kitchenBtn = document.createElement('button');
                kitchenBtn.className = 'comanda-cocina-btn';
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
                kitchenBtn.onclick = () => this.printKitchenTicket();
                
                validarBtn.parentElement.insertBefore(kitchenBtn, validarBtn);
                console.log("✅ Kitchen button added!");
            }
        }, 1000);
    },
    
    printKitchenTicket() {
        console.log("Printing kitchen ticket with real data...");
        const order = this.pos.get_order();
        
        if (!order || order.get_orderlines().length === 0) {
            alert("No hay productos en la orden");
            return;
        }
        
        // Get real order data
        const orderData = {
            orderName: order.name || order.uid || `Orden-${Date.now()}`,
            date: new Date().toLocaleString('es-GT'),
            cashier: this.pos.get_cashier()?.name || this.pos.user?.name || 'Usuario',
            customer: order.get_partner()?.name || 'Consumidor Final',
            table: order.table?.name || '',
            total: order.get_total_with_tax().toFixed(2),
            lines: order.get_orderlines().map(line => ({
                qty: line.get_quantity(),
                product: line.get_full_product_name(),
                price: line.get_display_price().toFixed(2),
                note: line.get_customer_note() || ''
            }))
        };
        
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Comanda ${orderData.orderName}</title>
                <style>
                    @page { size: 80mm 297mm; margin: 0; }
                    @media print { 
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                    body { 
                        font-family: 'Courier New', monospace; 
                        width: 280px;
                        margin: 0 auto;
                        padding: 10px;
                        font-size: 12px;
                    }
                    h2 { 
                        text-align: center; 
                        font-size: 18px;
                        margin: 10px 0;
                        border-top: 2px dashed #000;
                        border-bottom: 2px dashed #000;
                        padding: 5px 0;
                    }
                    .info { 
                        margin: 10px 0;
                        line-height: 1.4;
                    }
                    .info div { margin: 3px 0; }
                    .lines { margin: 15px 0; }
                    .line { 
                        display: flex;
                        margin: 8px 0;
                        align-items: flex-start;
                    }
                    .qty { 
                        width: 40px;
                        text-align: right;
                        font-weight: bold;
                        font-size: 14px;
                        padding-right: 10px;
                    }
                    .product { 
                        flex: 1;
                        font-size: 13px;
                    }
                    .note {
                        margin-left: 50px;
                        font-style: italic;
                        color: #555;
                        font-size: 11px;
                    }
                    hr { 
                        border: none;
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-weight: bold;
                    }
                    .total {
                        text-align: right;
                        font-size: 16px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <h2>🍴 COMANDA DE COCINA 🍴</h2>
                
                <div class="info">
                    <div><strong>Orden:</strong> ${orderData.orderName}</div>
                    <div><strong>Fecha:</strong> ${orderData.date}</div>
                    <div><strong>Cajero:</strong> ${orderData.cashier}</div>
                    ${orderData.table ? `<div><strong>Mesa:</strong> ${orderData.table}</div>` : ''}
                    <div><strong>Cliente:</strong> ${orderData.customer}</div>
                </div>
                
                <hr>
                
                <div class="lines">
                    ${orderData.lines.map(line => `
                        <div class="line">
                            <div class="qty">${line.qty}</div>
                            <div class="product">${line.product}</div>
                        </div>
                        ${line.note ? `<div class="note">Nota: ${line.note}</div>` : ''}
                    `).join('')}
                </div>
                
                <hr>
                
                <div class="total">
                    TOTAL: Q ${orderData.total}
                </div>
                
                <hr>
                
                <div class="footer">
                    *** FIN DE COMANDA ***<br>
                    PREPARAR INMEDIATAMENTE
                </div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => printWindow.close(), 100);
            }, 100);
        }
    }
});

console.log("✅ Kitchen Module Loaded!");
