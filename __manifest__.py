{
    "name": "POS Kitchen Ticket",
    "version": "17.0.4.0",
    "license": "LGPL-3",
    "author": "Kesiyos",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_kitchen_report.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_kitchen_ticket/static/src/js/**/*.js",
            "pos_kitchen_ticket/static/src/xml/**/*.xml",
            "pos_kitchen_ticket/static/src/css/**/*.css",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
}
