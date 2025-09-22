# -*- coding: utf-8 -*-

from odoo import models, fields, api

class PosSession(models.Model):
    _inherit = 'pos.session'
    
    def _loader_params_pos_order(self):
        """Agregar campos de cocina a los parámetros de carga"""
        result = super()._loader_params_pos_order()
        result['search_params']['fields'].extend([
            'kitchen_printed', 
            'kitchen_print_count',
            'order_type_kitchen',
            'special_instructions'
        ])
        return result
    
    def _loader_params_pos_order_line(self):
        """Agregar campos de cocina a las líneas de orden"""
        result = super()._loader_params_pos_order_line()
        result['search_params']['fields'].extend([
            'kitchen_state',
            'kitchen_notes'
        ])
        return result
