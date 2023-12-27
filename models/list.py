from odoo import models, fields, api
from odoo.exceptions import UserError


class TypeList(models.Model):
    _name = "todo.type"
    _description = "Type of Todo List"

    _sql_constraints = [
        ("unique_type", "unique(name)", "The Todo Type must be unique"),
    ]

    name = fields.Char("Name", required=True)
    tasks = fields.One2many("todo.task", "task_type", string="Tasks")

    @api.model
    def create_type(self, vals):
        new_type = super(TypeList, self).create(vals)
        return new_type.read(["name", "id"])

    def get_all_types(self):
        data = self.env["todo.type"].search([]).read(["id", "name"])
        return {"data": data}
