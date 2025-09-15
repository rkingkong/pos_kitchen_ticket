{
    'name': 'POS Kitchen Ticket',
    'version': '17.0.1.0',
    'category': 'Point of Sale',
    'summary': 'Kitchen ticket button in payment screen',
    'depends': ['point_of_sale'],
    'installable': True,
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_kitchen_ticket/static/src/**/*',
        ],
    },
}
