from odoo import fields, models, api
from collections import defaultdict
from dateutil.relativedelta import relativedelta
from datetime import date


class TodoTask(models.Model):
    _name = "todo.task"

    _description = "This model contains the information related to the daily task"

    name = fields.Char("Title", required=True)

    finish_date = fields.Date("Actual Completion Date", default=date.today())

    priority = fields.Selection(
        selection=[
            ("3", "High"),
            ("2", "Medium"),
            ("1", "Low"),
        ],
        string="Priority",
        default="meduim",
    )
    is_completed = fields.Boolean("Is Completed", default=False)

    task_type = fields.Many2one("todo.type", string="Type")
    user_id = fields.Many2one(
        "res.users", string="User", default=lambda self: self.env.user
    )

    @api.model
    def create_task(self, vals):
        new_task = super(TodoTask, self).create(vals)
        return new_task.read()

    @api.model
    def set_task_completed(self, vals):
        print("vals---------------------", vals)
        try:
            print("try")
            self.env["todo.task"].browse(vals["id"]).write({"is_completed": True})
            return {
                "type": "ir.actions.client",
                "tag": "display_notification",
                "params": {
                    "title": ("Task Completion Status"),
                    "message": "Task Completed Successfully",
                    "type": "success",
                    "sticky": False,
                },
            }
        except Exception as e:
            print("catch", e)

            return {
                "type": "ir.actions.client",
                "tag": "display_notification",
                "params": {
                    "title": ("Task Completion Status"),
                    "message": e,
                    "type": "danger",
                    "sticky": False,
                },
            }

    def get_all_tasks(self):
        data = {}
        # today = 0
        # upcoming = 0
        # overdue = 0
        today = []
        upcoming = []
        overdue = []
        data["tasks"] = []  # defaultdict(lambda: defaultdict(list)))
        for task in (
            self.env["todo.task"]
            .search(
                [("user_id", "=", self.env.user.id), ("is_completed", "=", False)],
                order="priority",
            )
            .read()
        ):
            if task["finish_date"] > date.today():
                # upcoming += 1
                upcoming.append(task)
            elif task["finish_date"] == date.today():
                # today += 1
                today.append(task)
            elif task["finish_date"] < date.today():
                # overdue += 1
                overdue.append(task)

        return {
            "todays_task": today,
            "upcoming_task": upcoming,
            "overdue_task": overdue,
