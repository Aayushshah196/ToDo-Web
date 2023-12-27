odoo.define("todo.taskmodal", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const CreateTaskModalWidget = Widget.extend({
		events: {
			"click .create-btn": "on_click_create",
			"click .close-btn": "on_click_cancel",
			"click .close": "on_click_cancel"
		},
		init: function (parent) {
			this._super(parent);
		},
		start: function () {
			this._super.apply(this, arguments);
			var self = this;
			this._rpc({
				model: "todo.type",
				method: "get_all_types",
				args: [{}]
			})
				.then(function (result) {
					self.$el.html(
						qweb.render("create_task_modal", { task_types: result.data })
					);
				})
				.catch(function (error) {
					console.log("Error-------------------------");
					console.log(error);
				});
		},
		on_click_create: function (e) {
			var self = this;
			var name = this.$("input[name='name']").val();
			if (name.trim() === "") {
				this.$(".error").css("display", "block");
				return;
			}
			var task_type = this.$("select[name='task_type']").val();
			var task_priority = this.$("select[name='task_priority']").val();
			var finish_date = this.$("input[name='date_joined']").val();
			if (finish_date.trim() === "") {
				this.$(".derror").css("display", "block");
				return;
			}
			this._rpc({
				model: "todo.task",
				method: "create_task",
				args: [
					{
						name: name,
						priority: task_priority,
						task_type: task_type,
						finish_date: finish_date
					}
				]
			})
				.then(function (result) {
					if (result) {
						self.trigger_up("task_added", { task: result });
						self.do_notify("success", "Task Created Successfully!");
						self.on_click_cancel();
					}
				})
				.catch(function (error) {
					self.do_notify("error", "Task Creation Failed!");
					console.log(error);
				});
		},
		on_click_cancel: function (e) {
			this.trigger_up("clear_modal");
		}
	});

	return CreateTaskModalWidget;
});
