# -*- coding: utf-8 -*-
{
    'name': 'POS Kitchen Ticket - Kesiyos',
    'version': '17.0.1.0',
    'category': 'Point of Sale',
    'summary': 'Sistema de comandas de cocina para restaurante fast-casual',
    'description': """
        Módulo de Comandas de Cocina para Kesiyos
        ===========================================
        
        Características:
        - Botón de impresión de comanda en pantalla de pago
        - Impresión antes o después del pago
        - Reimpresión de comandas y recibos
        - Agrupación de productos por categoría
        - Soporte para tipos de orden (Para Llevar, Comer Aquí, Domicilio)
        - Instrucciones especiales para cocina
        - Compatible con impresora Epson TM-88V
        - Interfaz completamente en español
        
        Desarrollado específicamente para Kesiyos Fast-Casual Restaurant
    """,
    'author': 'Kesiyos Development',
    'website': 'https://kesiyos.com',
    'depends': [
        'point_of_sale',
        'pos_restaurant',  # Para funcionalidades de restaurante si están disponibles
    ],
    'data': [
        # Security
        'security/ir.model.access.csv',
        
        # Views
        'views/pos_config_view.xml',
        
        # Reports
        'report/kitchen_ticket_report.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            # CSS
            'pos_kitchen_ticket/static/src/css/kitchen_ticket.css',
            
            # JavaScript
            'pos_kitchen_ticket/static/src/js/Screens/PaymentScreen/PaymentScreen.js',
            'pos_kitchen_ticket/static/src/js/Screens/ProductScreen/ProductScreen.js',
            
            # XML Templates
            'pos_kitchen_ticket/static/src/xml/Screens/PaymentScreen.xml',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
