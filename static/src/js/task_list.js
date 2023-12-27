odoo.define("todo.tasklist", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const TaskListWidget = Widget.extend({
		events: {
			"click .checkbox": "on_click_checkbox"
		},
		init: function (parent, data) {
			this.tasks = data;
			this._super(parent);
		},
		start: function () {
			this._super.apply(this, arguments);
			this.$el.html(qweb.render("task-list", { tasks: this.tasks }));
		},
		on_click_checkbox: function (e) {
			var self = this;
			const idx = $(e.currentTarget).attr("index");
			const id = $(e.currentTarget).attr("id");
			this._rpc({
				model: "todo.task",
				method: "set_task_completed",
				args: [{ id: id }]
			})
				.then(function (result) {
					self.trigger_up("task_completed", { idx: idx });
				})
				.catch(function (error) {
					console.log("error on task completion", error);
				});
		}
	});

	return TaskListWidget;
});
