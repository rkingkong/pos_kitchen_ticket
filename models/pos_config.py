# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class PosConfig(models.Model):
    _inherit = 'pos.config'
    
    # Kitchen printer settings
    kitchen_printer_enabled = fields.Boolean(
        string='Habilitar Impresora de Cocina',
        default=True,
        help='Activar impresión de comandas de cocina'
    )
    
    kitchen_printer_name = fields.Char(
        string='Nombre de Impresora de Cocina',
        default='EPSON TM-88V',
        help='Nombre exacto de la impresora en Windows'
    )
    
    auto_print_kitchen = fields.Boolean(
        string='Imprimir Automáticamente a Cocina',
        default=False,
        help='Imprimir comanda automáticamente al confirmar orden'
    )
    
    print_kitchen_before_payment = fields.Boolean(
        string='Permitir Impresión Antes del Pago',
        default=True,
        help='Permitir imprimir comanda de cocina antes de procesar el pago'
    )
    
    group_kitchen_items_by_category = fields.Boolean(
        string='Agrupar Productos por Categoría',
        default=True,
        help='Agrupar productos por categoría en la comanda de cocina'
    )
    
    kitchen_receipt_header = fields.Text(
        string='Encabezado de Comanda',
        default='COMANDA DE COCINA',
        help='Texto del encabezado de la comanda'
    )
    
    kitchen_receipt_footer = fields.Text(
        string='Pie de Comanda',
        default='*** PREPARAR INMEDIATAMENTE ***',
        help='Texto del pie de la comanda'
    )
