# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from datetime import datetime

class PosOrder(models.Model):
    _inherit = 'pos.order'
    
    kitchen_printed = fields.Boolean(
        string='Enviado a Cocina',
        default=False,
        help='Indica si la orden fue enviada a cocina'
    )
    
    kitchen_print_count = fields.Integer(
        string='Veces Impreso en Cocina',
        default=0,
        help='Número de veces que se ha impreso la comanda'
    )
    
    kitchen_print_datetime = fields.Datetime(
        string='Última Impresión de Cocina',
        help='Fecha y hora de la última impresión de cocina'
    )
    
    # Create new field without conflicts
    order_type_kitchen = fields.Selection([
        ('comer_aqui', 'Para Comer Aquí'),
        ('para_llevar', 'Para Llevar'),
        ('domicilio', 'A Domicilio')
    ], string='Tipo de Orden', default='comer_aqui')
    
    special_instructions = fields.Text(
        string='Instrucciones Especiales',
        help='Notas especiales para la cocina'
    )
    
    def print_kitchen_ticket(self):
        """Imprimir comanda de cocina"""
        self.ensure_one()
        
        # Marcar como impreso
        self.write({
            'kitchen_printed': True,
            'kitchen_print_count': self.kitchen_print_count + 1,
            'kitchen_print_datetime': fields.Datetime.now()
        })
        
        # Retornar la acción de reporte
        return self.env.ref('pos_kitchen_ticket.action_report_pos_kitchen').report_action(self)
    
    def get_kitchen_receipt_data(self):
        """Preparar datos para la comanda de cocina"""
        self.ensure_one()
        
        # Agrupar líneas por categoría si está configurado
        lines_by_category = {}
        
        for line in self.lines:
            # Get category name - handle both pos_categ_id and pos_categ_ids
            category_name = 'Sin Categoría'
            if hasattr(line.product_id, 'pos_categ_id') and line.product_id.pos_categ_id:
                category_name = line.product_id.pos_categ_id.name
            elif hasattr(line.product_id, 'pos_categ_ids') and line.product_id.pos_categ_ids:
                category_name = line.product_id.pos_categ_ids[0].name if line.product_id.pos_categ_ids else 'Sin Categoría'
            elif hasattr(line.product_id, 'categ_id') and line.product_id.categ_id:
                category_name = line.product_id.categ_id.name
            
            if category_name not in lines_by_category:
                lines_by_category[category_name] = []
            
            # Get product name
            product_name = line.product_id.display_name
            if hasattr(line, 'full_product_name') and line.full_product_name:
                product_name = line.full_product_name
            
            # Get customer note
            note = ''
            if hasattr(line, 'customer_note'):
                note = line.customer_note or ''
            elif hasattr(line, 'note'):
                note = line.note or ''
            
            lines_by_category[category_name].append({
                'qty': int(line.qty),
                'product_name': product_name,
                'note': note,
                'price_unit': line.price_unit,
                'price_subtotal': line.price_subtotal_incl,
            })
        
        # Ordenar categorías alfabéticamente
        sorted_categories = sorted(lines_by_category.items())
        
        # Format date
        date_str = ''
        if self.date_order:
            date_str = fields.Datetime.context_timestamp(self, self.date_order).strftime('%d/%m/%Y %H:%M')
        
        # Get order type
        order_type_value = self.order_type_kitchen or 'comer_aqui'
        order_type_display = {
            'comer_aqui': 'Para Comer Aquí',
            'para_llevar': 'Para Llevar', 
            'domicilio': 'A Domicilio'
        }.get(order_type_value, 'Para Comer Aquí')
        
        return {
            'order': self,
            'order_name': self.name or f"Orden-{self.id}",
            'order_type': order_type_display,
            'date_order': date_str,
            'partner_name': self.partner_id.name if self.partner_id else 'Consumidor Final',
            'cashier': self.user_id.name if self.user_id else 'Usuario',
            'total': self.amount_total,
            'special_instructions': self.special_instructions or '',
            'lines_by_category': sorted_categories,
            'print_count': self.kitchen_print_count,
            'reprint': self.kitchen_print_count > 1
        }


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'
    
    kitchen_state = fields.Selection([
        ('pending', 'Pendiente'),
        ('preparing', 'En Preparación'),
        ('ready', 'Listo'),
        ('delivered', 'Entregado')
    ], string='Estado en Cocina', default='pending')
    
    kitchen_notes = fields.Text(
        string='Notas de Cocina',
        help='Notas específicas para la preparación en cocina'
    )
