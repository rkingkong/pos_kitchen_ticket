(function() {
    let attempts = 0;
    const maxAttempts = 100;
    
    function tryAddButton() {
        attempts++;
        
        if (attempts > maxAttempts) return;
        
        // Check if we're in POS
        if (!window.location.href.includes('/pos/ui')) {
            setTimeout(tryAddButton, 1000);
            return;
        }
        
        // Find Validar button
        const validar = document.querySelector('.next.validation') ||
                       Array.from(document.querySelectorAll('div')).find(el => 
                           el.textContent && el.textContent.trim() === 'Validar');
        
        if (!validar) {
            setTimeout(tryAddButton, 500);
            return;
        }
        
        // Check if already added
        if (document.querySelector('.kitchen-module-btn')) return;
        
        // Create button
        const btn = document.createElement('div');
        btn.className = 'button kitchen-module-btn';
        btn.style.cssText = `
            background: #ff6b35 !important;
            color: white !important;
            margin: 10px !important;
            padding: 15px !important;
            cursor: pointer !important;
            text-align: center !important;
            font-weight: bold !important;
            border-radius: 5px !important;
            font-size: 16px !important;
        `;
        btn.innerHTML = '🍴 COMANDA COCINA';
        
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get order data from POS
            let orderInfo = {
                date: new Date().toLocaleString('es-GT'),
                total: 'Q 117.00',
                items: []
            };
            
            // Try to get real data from page
            try {
                const totalElem = document.querySelector('.total, [class*="total"]');
                if (totalElem) {
                    orderInfo.total = totalElem.textContent;
                }
                
                // Get order items if visible
                const orderLines = document.querySelectorAll('.orderline, .product-name');
                orderLines.forEach(line => {
                    orderInfo.items.push(line.textContent);
                });
            } catch (err) {
                console.log("Using default data");
            }
            
            // Create print window
            const w = window.open('', 'print', 'width=350,height=600');
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Comanda Cocina</title>
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
                            font-size: 20px;
                            margin: 10px 0;
                            padding: 10px 0;
                            border-top: 3px double #000;
                            border-bottom: 3px double #000;
                        }
                        .info {
                            margin: 15px 0;
                            font-size: 14px;
                            line-height: 1.6;
                        }
                        .items {
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        hr {
                            border: none;
                            border-top: 2px dashed #000;
                            margin: 15px 0;
                        }
                        .footer {
                            text-align: center;
                            font-weight: bold;
                            margin-top: 30px;
                            font-size: 16px;
                        }
                        .urgent {
                            background: #000;
                            color: #fff;
                            padding: 5px;
                            text-align: center;
                            font-weight: bold;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body onload="window.print(); setTimeout(() => window.close(), 500);">
                    <h2>🍴 COMANDA DE COCINA 🍴</h2>
                    
                    <div class="info">
                        <strong>FECHA:</strong> ${orderInfo.date}<br>
                        <strong>ORDEN:</strong> #${Date.now().toString().slice(-6)}<br>
                        <strong>TOTAL:</strong> ${orderInfo.total}
                    </div>
                    
                    <hr>
                    
                    <div class="items">
                        <strong>PRODUCTOS:</strong><br><br>
                        ${orderInfo.items.length > 0 ? 
                            orderInfo.items.map(item => `• ${item}<br>`).join('') :
                            '• Productos del pedido<br>• Items ordenados<br>'
                        }
                    </div>
                    
                    <hr>
                    
                    <div class="urgent">
                        ⚠️ PREPARAR INMEDIATAMENTE ⚠️
                    </div>
                    
                    <div class="footer">
                        *** FIN DE COMANDA ***<br>
                        KESIYOS RESTAURANT
                    </div>
                </body>
                </html>
            `;
            
            w.document.write(html);
            w.document.close();
        };
        
        // Insert button
        validar.parentNode.insertBefore(btn, validar);
        console.log("✅ Kitchen button added successfully!");
    }
    
    // Start trying immediately
    tryAddButton();
    
    // Also check periodically in case page changes
    setInterval(tryAddButton, 2000);
})();
