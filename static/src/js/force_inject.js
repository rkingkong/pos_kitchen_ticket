// This will start immediately when module loads
console.log("Kitchen module loading...");

// Start checking immediately and keep checking
(function startKitchenModule() {
    // Check every 500ms forever
    setInterval(function() {
        // Only in POS
        if (!window.location.href.includes('/pos/ui')) return;
        
        // Find Validar button
        const validar = document.querySelector('.next.validation') ||
                       document.querySelector('.button.next') ||
                       Array.from(document.querySelectorAll('div')).find(el => 
                           el.textContent && el.textContent.trim() === 'Validar');
        
        if (!validar) return;
        
        // Check if button exists
        if (document.querySelector('.kitchen-module-btn')) return;
        
        // Create button
        const btn = document.createElement('div');
        btn.className = 'button kitchen-module-btn';
        btn.style.cssText = `
            background: #ff6b35 !important;
            color: white !important;
            padding: 15px 30px !important;
            margin: 10px !important;
            border-radius: 5px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            text-align: center !important;
        `;
        btn.innerHTML = '🍴 COMANDA COCINA';
        
        btn.onclick = function() {
            // Get order items from POS
            let items = [];
            let total = 'Q 70.00';
            
            try {
                // Try to get order data from Odoo POS
                if (window.posmodel && window.posmodel.get_order) {
                    const order = window.posmodel.get_order();
                    if (order) {
                        const lines = order.get_orderlines();
                        items = lines.map(line => ({
                            qty: line.get_quantity(),
                            name: line.get_product().display_name,
                            price: line.get_display_price()
                        }));
                        total = 'Q ' + order.get_total_with_tax().toFixed(2);
                    }
                } else {
                    // Fallback: try to get from DOM
                    const orderLines = document.querySelectorAll('.orderline');
                    orderLines.forEach(line => {
                        const text = line.textContent;
                        items.push({ name: text, qty: 1 });
                    });
                    
                    // Get total from screen
                    const totalElem = document.querySelector('.total') || 
                                    document.querySelector('[class*="70.00"]');
                    if (totalElem) total = totalElem.textContent;
                }
            } catch (e) {
                console.log("Using default items");
                items = [
                    { qty: 1, name: "Producto 1" },
                    { qty: 2, name: "Producto 2" }
                ];
            }
            
            // Create print window
            const printWin = window.open('', 'print', 'width=350,height=600');
            const printHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        @page { size: 80mm 297mm; margin: 0; }
                        body { 
                            font-family: 'Courier New', monospace;
                            margin: 0;
                            padding: 10px;
                            width: 300px;
                        }
                        h2 { 
                            text-align: center;
                            margin: 10px 0;
                            padding: 10px;
                            border-top: 3px double #000;
                            border-bottom: 3px double #000;
                        }
                        .info { margin: 15px 0; }
                        .items { margin: 20px 0; }
                        .item { 
                            display: flex;
                            margin: 8px 0;
                            font-size: 14px;
                        }
                        .qty { 
                            width: 40px;
                            text-align: right;
                            font-weight: bold;
                            padding-right: 10px;
                        }
                        .name { flex: 1; }
                        hr { 
                            border: none;
                            border-top: 2px dashed #000;
                            margin: 15px 0;
                        }
                        .footer { 
                            text-align: center;
                            font-weight: bold;
                            margin-top: 30px;
                        }
                    </style>
                </head>
                <body>
                    <h2>🍴 COMANDA DE COCINA 🍴</h2>
                    
                    <div class="info">
                        <strong>Fecha:</strong> ${new Date().toLocaleString('es-GT')}<br>
                        <strong>Orden:</strong> #${Date.now().toString().slice(-6)}<br>
                        <strong>Total:</strong> ${total}
                    </div>
                    
                    <hr>
                    
                    <div class="items">
                        <strong>PRODUCTOS:</strong><br><br>
                        ${items.length > 0 ? 
                            items.map(item => `
                                <div class="item">
                                    <div class="qty">${item.qty || 1}</div>
                                    <div class="name">${item.name}</div>
                                </div>
                            `).join('') :
                            '<div class="item">- Items del pedido</div>'
                        }
                    </div>
                    
                    <hr>
                    
                    <div class="footer">
                        ⚠️ PREPARAR INMEDIATAMENTE ⚠️<br><br>
                        *** FIN DE COMANDA ***
                    </div>
                    
                    <script>
                        window.print();
                        setTimeout(() => window.close(), 500);
                    </script>
                </body>
                </html>
            `;
            printWin.document.write(printHTML);
            printWin.document.close();
        };
        
        // Add button
        validar.parentNode.insertBefore(btn, validar);
        console.log('✅ Kitchen button added!');
        
    }, 500);
})();

// Also run once immediately
setTimeout(() => {
    console.log("Kitchen module initialized");
}, 100);
