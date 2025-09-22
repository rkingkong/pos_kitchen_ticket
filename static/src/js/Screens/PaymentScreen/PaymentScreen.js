/** @odoo-module **/

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { ErrorPopup } from "@point_of_sale/app/errors/popups/error_popup";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.notification = useService("notification");
        this.popup = useService("popup");
        this.kitchenPrinted = false;
    },

    async onClickPrintKitchen() {
        const order = this.pos.get_order();
        
        if (!order || order.get_orderlines().length === 0) {
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No hay productos en la orden"),
            });
            return;
        }

        try {
            // Check if this is a reprint
            if (this.kitchenPrinted) {
                const { confirmed } = await this.popup.add(ConfirmPopup, {
                    title: _t("Reimprimir Comanda"),
                    body: _t("Esta orden ya fue enviada a cocina. ¿Desea reimprimir?"),
                });
                
                if (!confirmed) return;
            }

            // Prepare and print
            const receiptData = this.prepareKitchenReceiptData(order);
            await this.printKitchenReceipt(receiptData);
            
            // Mark as printed
            this.kitchenPrinted = true;
            
            // Show success notification
            this.notification.add(_t("Comanda enviada a cocina"), {
                type: 'success',
                sticky: false,
            });
            
        } catch (error) {
            console.error("Error al imprimir comanda:", error);
            await this.popup.add(ErrorPopup, {
                title: _t("Error de Impresión"),
                body: _t("No se pudo enviar la comanda a cocina. Verifique la impresora."),
            });
        }
    },

    prepareKitchenReceiptData(order) {
        const lines = order.get_orderlines();
        const groupedLines = {};
        
        // Group products by category
        lines.forEach(line => {
            // Get category name - handle different field structures
            let categoryName = 'Sin Categoría';
            if (line.product.pos_categ_id && line.product.pos_categ_id.length > 0) {
                categoryName = line.product.pos_categ_id[1];
            } else if (line.product.categ_id && line.product.categ_id.length > 0) {
                categoryName = line.product.categ_id[1];
            }
            
            if (!groupedLines[categoryName]) {
                groupedLines[categoryName] = [];
            }
            
            groupedLines[categoryName].push({
                qty: line.get_quantity(),
                product: line.get_display_name(),
                note: line.get_note ? line.get_note() : '',
                price: line.get_display_price(),
            });
        });

        // Sort categories
        const sortedCategories = Object.keys(groupedLines).sort();
        const categoriesWithLines = sortedCategories.map(cat => ({
            name: cat,
            lines: groupedLines[cat]
        }));

        // Get order type (default if not set)
        let orderType = 'PARA COMER AQUÍ';
        if (order.order_type === 'para_llevar') {
            orderType = 'PARA LLEVAR';
        } else if (order.order_type === 'domicilio') {
            orderType = 'A DOMICILIO';
        }

        return {
            order: order,
            orderName: order.name || `Orden ${order.uid || ''}`,
            orderType: orderType,
            date: new Date().toLocaleString('es-GT'),
            cashier: this.pos.user.name,
            customer: order.get_partner() ? order.get_partner().name : 'Consumidor Final',
            total: this.env.utils.formatCurrency(order.get_total_with_tax()),
            categories: categoriesWithLines,
            specialInstructions: order.special_instructions || '',
            reprint: this.kitchenPrinted
        };
    },

    async printKitchenReceipt(receiptData) {
        // Create HTML for printing
        const printContent = this.renderKitchenReceipt(receiptData);
        
        // Create print window
        const printWindow = window.open('', 'PRINT', 'height=600,width=350');
        
        if (!printWindow) {
            throw new Error("No se pudo abrir la ventana de impresión");
        }
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Auto print after a short delay
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => printWindow.close(), 100);
        }, 250);
    },

    renderKitchenReceipt(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Comanda ${data.orderName}</title>
                <style>
                    @page { 
                        size: 80mm 297mm; 
                        margin: 0;
                    }
                    @media print { 
                        body { margin: 0; }
                    }
                    body { 
                        font-family: 'Courier New', monospace; 
                        width: 280px;
                        margin: 0 auto;
                        padding: 10px;
                        font-size: 12px;
                        line-height: 1.3;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px dashed #000;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    .header h1 {
                        font-size: 18px;
                        margin: 5px 0;
                        font-weight: bold;
                    }
                    .order-type {
                        font-size: 16px;
                        font-weight: bold;
                        padding: 5px;
                        border: 2px solid #000;
                        margin: 10px 0;
                        text-align: center;
                    }
                    .info-line {
                        margin: 5px 0;
                        display: flex;
                        justify-content: space-between;
                    }
                    .category {
                        margin-top: 15px;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                    }
                    .category-name {
                        font-weight: bold;
                        font-size: 14px;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                        text-decoration: underline;
                    }
                    .item {
                        margin: 8px 0;
                        display: flex;
                        align-items: flex-start;
                    }
                    .item-qty {
                        min-width: 30px;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .item-name {
                        flex: 1;
                        padding-left: 10px;
                    }
                    .item-note {
                        margin-left: 40px;
                        font-style: italic;
                        margin-top: 3px;
                    }
                    .special-instructions {
                        border: 1px solid #000;
                        padding: 10px;
                        margin: 15px 0;
                        background: #f0f0f0;
                    }
                    .footer {
                        text-align: center;
                        border-top: 2px dashed #000;
                        padding-top: 10px;
                        margin-top: 20px;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    .reprint-mark {
                        text-align: center;
                        font-weight: bold;
                        font-size: 14px;
                        margin: 10px 0;
                        padding: 5px;
                        border: 1px solid #000;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>COMANDA DE COCINA</h1>
                    ${data.reprint ? '<div class="reprint-mark">*** REIMPRESIÓN ***</div>' : ''}
                </div>
                
                <div class="order-type">${data.orderType}</div>
                
                <div class="info">
                    <div class="info-line">
                        <span>Orden:</span>
                        <strong>${data.orderName}</strong>
                    </div>
                    <div class="info-line">
                        <span>Fecha:</span>
                        <span>${data.date}</span>
                    </div>
                    <div class="info-line">
                        <span>Cajero:</span>
                        <span>${data.cashier}</span>
                    </div>
                    ${data.customer !== 'Consumidor Final' ? 
                        `<div class="info-line">
                            <span>Cliente:</span>
                            <span>${data.customer}</span>
                        </div>` : ''}
                </div>
                
                ${data.categories.map(category => `
                    <div class="category">
                        <div class="category-name">${category.name}</div>
                        ${category.lines.map(line => `
                            <div class="item">
                                <span class="item-qty">${line.qty}x</span>
                                <span class="item-name">${line.product}</span>
                            </div>
                            ${line.note ? `<div class="item-note">Nota: ${line.note}</div>` : ''}
                        `).join('')}
                    </div>
                `).join('')}
                
                ${data.specialInstructions ? `
                    <div class="special-instructions">
                        <strong>INSTRUCCIONES ESPECIALES:</strong><br>
                        ${data.specialInstructions}
                    </div>
                ` : ''}
                
                <div class="footer">
                    *** PREPARAR INMEDIATAMENTE ***
                </div>
            </body>
            </html>
        `;
    },

    async onClickReprintReceipt() {
        // Function to reprint FEL receipt
        const order = this.pos.get_order();
        
        if (!order) {
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No hay orden activa"),
            });
            return;
        }

        try {
            // Call standard receipt print
            if (this.printer && this.printer.print_receipt) {
                await this.printer.print_receipt(order);
            } else {
                // Fallback to window print
                window.print();
            }
            
            this.notification.add(_t("Recibo reimpreso"), {
                type: 'success',
                sticky: false,
            });
        } catch (error) {
            console.error("Error al reimprimir:", error);
            await this.popup.add(ErrorPopup, {
                title: _t("Error"),
                body: _t("No se pudo reimprimir el recibo"),
            });
        }
    }
});
