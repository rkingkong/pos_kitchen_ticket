# -*- coding: utf-8 -*-

from odoo import http, fields
from odoo.http import request
import json

class PosKitchenController(http.Controller):
    
    @http.route('/pos/print_kitchen_ticket', type='json', auth='user')
    def print_kitchen_ticket(self, order_id):
        """
        Endpoint para imprimir comanda de cocina desde el POS
        """
        try:
            order = request.env['pos.order'].browse(order_id)
            if order.exists():
                # Ejecutar la impresión
                return order.print_kitchen_ticket()
            else:
                return {'error': 'Orden no encontrada'}
        except Exception as e:
            return {'error': str(e)}
    
    @http.route('/pos/get_kitchen_receipt', type='json', auth='user')
    def get_kitchen_receipt(self, order_id):
        """
        Obtener datos de la comanda para renderizar en el cliente
        """
        try:
            order = request.env['pos.order'].browse(order_id)
            if order.exists():
                return order.get_kitchen_receipt_data()
            else:
                return {'error': 'Orden no encontrada'}
        except Exception as e:
            return {'error': str(e)}
    
    @http.route('/pos/mark_kitchen_printed', type='json', auth='user')
    def mark_kitchen_printed(self, order_id):
        """
        Marcar orden como enviada a cocina
        """
        try:
            order = request.env['pos.order'].browse(order_id)
            if order.exists():
                order.write({
                    'kitchen_printed': True,
                    'kitchen_print_count': order.kitchen_print_count + 1,
                    'kitchen_print_datetime': fields.Datetime.now()
                })
                return {'success': True}
            else:
                return {'error': 'Orden no encontrada'}
        except Exception as e:
            return {'error': str(e)}
