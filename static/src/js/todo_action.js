odoo.define("todo.clientAction", function (require) {
	"use strict";

	const AbstractAction = require("web.AbstractAction");
	const Widget = require("web.Widget");
	var session = require("web.session");
	const core = require("web.core");
	const rpc = require("web.rpc");
	var qweb = core.qweb;

	const NavbarWidget = require("todo.navbar");
	const DashboardWidget = require("todo.dashboard");
	const TaskListWidget = require("todo.tasklist");
	const TaskAccordionWidget = require("todo.taskaccordion");
	const CreateTaskModalWidget = require("todo.taskmodal");
	const CreateTypeModalWidget = require("todo.typemodal");

	const groupBy = function (array, key) {
		/**
		 * Group an array of objects by a given key
		 * @param {Array} array - The array to group
		 * @param {String} key - The key to group by
		 * @return {Object} - An object containing the grouped array
		 */
		return array.reduce(function (result, item) {
			(result[item[key][1]] = result[item[key][1]] || []).push(item);
			return result;
		}, {});
	};

	const TodoWebAction = AbstractAction.extend({
		template: "todo.main",
		events: {
			"click .open_task_modal": "on_click_task_modal",
			"click .open_type_modal": "on_click_type_modal",
			"click .task-overview": "_onClickedTaskOverview"
		},
		custom_events: {
			clear_modal: "_onClearModal",
			type_added: "_onTaskTypeAdded",
			task_added: "_onTaskAdded",
			task_completed: "_onTaskCompletion"
		},
		title: "Todo Web",
		init: function () {
			this.login = true;
			this._super.apply(this, arguments);
			this.tasks = [];
			this.task_types = [];
			this.todays_task = [];
			this.overdue_task = [];
			this.upcoming_task = [];
			this.grouped_tasks = {};
			this.current_task_list = "todays";
			this.dashboard = [];
			this.modal_widget = null;
			this.navbar_widget = null;
			this.dashboard_widget = null;
			this.task_list_widget = null;
			this.task_accordion_widget = null;
		},
		willStart: function () {
			var self = this;
			let task_rpc = Promise.all([
				this._rpc({
					model: "todo.task",
					method: "get_all_tasks",
					args: [{}]
				})
					.then(function (result) {
						self.todays_task = result.todays_task;
						self.overdue_task = result.overdue_task;
						self.upcoming_task = result.upcoming_task;

						self.dashboard_widget = new DashboardWidget(self, [
							self.todays_task.length,
							self.upcoming_task.length,
							self.overdue_task.length
						]);
						self.dashboard = [
							self.todays_task.length,
							self.overdue_task.length,
							self.upcoming_task.length
						];
						self.tasks = result.todays_task;

						self.task_list_widget = new TaskListWidget(self, self.tasks);

						self.grouped_tasks = groupBy(self.todays_task, "task_type");
						self.task_accordion_widget = new TaskAccordionWidget(
							self,
							self.grouped_tasks
						);
					})
					.catch(function (error) {
						console.log("Error-------------------------");
						console.log(error);
					}),
				this._rpc({
					model: "todo.type",
					method: "get_all_types",
					args: [{}]
				})
					.then(function (result) {
						self.task_types = result.data;
					})
					.catch(function (error) {
						console.log("Error-------------------------");
						console.log(error);
					})
			]);
			return Promise.all([this._super.apply(this, arguments), task_rpc]);
		},
		start: function () {
			$("header").css("display", "none");
			var self = this;
			self.navbar_widget = new NavbarWidget(self);
			self.navbar_widget.appendTo(self.$(".o_navbar"));

			self.dashboard_widget.appendTo(self.$(".o_dashboard_container"));

			self.task_list_widget.appendTo(self.$(".o_task_list_container"));

			self.task_accordion_widget.appendTo(
				self.$(".o_task_accordion_container")
			);
		},
		on_click_task_modal: function (e) {
			var self = this;
			self.modal_widget = new CreateTaskModalWidget(self, self.task_types);
			self.modal_widget.appendTo(self.$(".o_modal"));
			self.$(".task-modal").css("display", "block");
			self.$(".task-modal").css("z-index", "5");
		},
		on_click_type_modal: function (e) {
			var self = this;
			self.modal_widget = new CreateTypeModalWidget(self);
			self.modal_widget.appendTo(self.$(".o_modal"));
			self.$(".type-modal").css("display", "block");
			self.$(".type-modal").css("z-index", "5");
		},
		_onClearModal: function (e) {
			this.$(".modal_form").remove();
			this.modal_widget.destroy();
			this.modal_widget = null;
		},
		_onTaskCompletion: function (idx) {
			var self = this;
			self.tasks.splice(idx, 1);
			// if (self.current_task_list === "todays") {
			// 	self.todays_task.splice(idx, 1);
			// } else if (self.current_task_list === "overdue") {
			// 	self.overdue_task.splice(idx, 1);
			// } else if (self.current_task_list === "upcoming") {
			// 	self.upcoming_task.splice(idx, 1);
			// }
			self._renderAll();
		},
		_onTaskTypeAdded: function (e) {
			this.task_types.push(e.data.task_type);
		},
		_onTaskAdded: function (e) {
			const task = e.data.task[0];
			var self = this;
			let date1 = new Date(task.finish_date);
			let date2 = new Date();
			date1.setHours(0, 0, 0, 0);
			date2.setHours(0, 0, 0, 0);
			if (date1 > date2) {
				self.upcoming_task.push(task);
			} else if (date1 < date2) {
				self.overdue_task.push(task);
			} else {
				self.todays_task.push(task);
			}

			if (self.current_task_list === "todays") {
				self.tasks = self.todays_task;
			} else if (self.current_task_list === "overdue") {
				self.tasks = self.overdue_task;
			} else if (self.current_task_list === "upcoming") {
				self.tasks = self.upcoming_task;
			}
			self._renderAll();
		},
		_onClickedTaskOverview: function (e) {
			const target = $(e.target).attr("name");
			this.current_task_list = target;
			if (target === "todays") {
				this.tasks = this.todays_task;
			} else if (target === "overdue") {
				this.tasks = this.overdue_task;
			} else if (target === "upcoming") {
				this.tasks = this.upcoming_task;
			}
			this._renderTasks();
		},
		_renderAll: function () {
			this._renderOverview();
			this._renderTasks();
		},
		_renderOverview: function () {
			this.$(".o_dashboard_container").empty();
			this.dashboard_widget = new DashboardWidget(this, [
				this.todays_task.length,
				this.upcoming_task.length,
				this.overdue_task.length
			]);
			this.dashboard_widget.appendTo(self.$(".o_dashboard_container"));
		},
		_renderTasks: function () {
			this.tasks.sort(function (a, b) {
				return b.priority - a.priority;
			});
			this.grouped_tasks = groupBy(this.tasks, "task_type");
			this.$(".o_task_list_container").empty();
			this.$(".o_task_accordion_container").empty();
			this.task_list_widget = new TaskListWidget(this, this.tasks);
			this.task_accordion_widget = new TaskAccordionWidget(
				this,
				this.grouped_tasks
			);
			this.task_list_widget.appendTo(this.$(".o_task_list_container"));

			this.task_accordion_widget.appendTo(
				this.$(".o_task_accordion_container")
			);
		}
	});

	core.action_registry.add("todo.web", TodoWebAction);
	return TodoWebAction;
});
