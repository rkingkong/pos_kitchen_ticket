{
    "name": "POS Kitchen Ticket",
    "version": "17.0.2.3",
    "depends": ["point_of_sale"],
    "data": ["views/pos_kitchen_report.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_kitchen_ticket/static/src/js/boot_log.js",
            "pos_kitchen_ticket/static/src/js/kitchen_button.js",
            "pos_kitchen_ticket/static/src/xml/kitchen_templates.xml",
        ],
        # Optional but harmless: also expose the QWeb to generic qweb bundle
        "web.assets_qweb": [
            "pos_kitchen_ticket/static/src/xml/kitchen_templates.xml",
        ],
    },
    "installable": True,
    "license": "LGPL-3",
}
