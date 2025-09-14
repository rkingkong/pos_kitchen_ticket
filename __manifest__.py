{
    "name": "POS Kitchen Ticket",
    "summary": "Comanda de cocina en formato ticket para POS",
    "version": "17.0.2.0",
    "license": "LGPL-3",
    "author": "Kesiyos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_kitchen_report.xml",  # el reporte backend (opcional)
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_kitchen_ticket/static/src/js/kitchen_button.js",
            "pos_kitchen_ticket/static/src/xml/kitchen_templates.xml",
        ],
    },
    "installable": True,
}
