from odoo import models, fields
from datetime import date
from dateutil.relativedelta import relativedelta


class Users(models.Model):
    _inherit = "res.users"

    def _default_dob(self):
        return date.today() + relativedelta(years=18)

    dob = fields.Date(
        string="Date of birth",
        default=lambda self: self._default_dob(),
    )

    phone = fields.Char("Phone Number")

    gender = fields.Char("Gender", default="Male")

    tasks = fields.One2many("todo.task", "user_id", string="User")

    def make_user(self, email):
        try:
            print("----------------------+------------------------------")
            group = self.env["res.groups"].search(
                [("name", "=", "Internal User")], limit=1
            )
            print(group)
            t_user = self.env["res.users"].search([("login", "=", email)], limit=1)
            print(t_user)
            t_user.write({"groups_id": [(6, 0, [group.id])]})
            print(t_user)
            return True
        except:
            return False
