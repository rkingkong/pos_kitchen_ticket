# -*- coding: utf-8 -*-
{
    'name': 'POS Kitchen Ticket',
    'version': '17.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Print kitchen tickets from POS payment screen',
    'description': """
        Kitchen Ticket Printing for Restaurants
        ========================================
        - Adds kitchen ticket button to payment screen
        - Prints order details for kitchen
        - Support for table and waiter information
        - Works with Odoo 17 Community
    """,
    'author': 'Kesiyos Restaurant',
    'website': 'https://kesiyos.gt',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_assets.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_kitchen_ticket/static/src/js/PaymentScreenButton.js',
            'pos_kitchen_ticket/static/src/xml/PaymentScreenButton.xml',
            'pos_kitchen_ticket/static/src/xml/KitchenReceipt.xml',
            'pos_kitchen_ticket/static/src/css/kitchen_ticket.css',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
