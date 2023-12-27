odoo.define("todo.taskaccordion", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const TaskAccordionWidget = Widget.extend({
		events: {
			"click .checkbox": "on_click_checkbox"
		},
		init: function (parent, data) {
			this.has_data = Object.keys(data).length != 0;
			this.task_groups = data;
			this._super(parent);
		},
		start: function () {
			this._super.apply(this, arguments);
			this.$el.html(
				qweb.render("task-accordion", {
					task_groups: this.task_groups,
					has_data: this.has_data
				})
			);
		},
		on_click_checkbox: function (e) {
			var self = this;

			const idx = $(e.currentTarget).attr("index");
			const id = $(e.currentTarget).attr("id");
			$(e.currentTarget).remove();

			this._rpc({
				model: "todo.task",
				method: "set_task_completed",
				args: [{ id: id }]
			})
				.then(function (result) {
					self.trigger_up("task_completed", { idx: idx });
					$(el).remove();
				})
				.catch(function (error) {
					console.log("error on task completion", error);
				});
		}
	});

	return TaskAccordionWidget;
});
