{
    "name": "POS Kitchen Ticket",
    "version": "17.0.3.0",
    "license": "LGPL-3",
    "author": "Kesiyos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_kitchen_report.xml",   # <- backend PDF action + template
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_kitchen_ticket/static/src/js/boot_log.js",
            "pos_kitchen_ticket/static/src/js/kitchen_button.js",
            "pos_kitchen_ticket/static/src/xml/kitchen_templates.xml",
        ],
        "web.assets_qweb": [
            "pos_kitchen_ticket/static/src/xml/kitchen_templates.xml",
        ],
    },
    "installable": True,
}
