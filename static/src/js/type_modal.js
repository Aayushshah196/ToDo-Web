odoo.define("todo.typemodal", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const CreateTypeModalWidget = Widget.extend({
		events: {
			"click .btn-submit": "on_click_create",
			"click .close-btn": "on_click_cancel",
			"click .close": "on_click_cancel"
		},
		init: function (parent) {
			this._super(parent);
		},
		start: function () {
			var self = this;
			this._super.apply(this, arguments);

			self.$el.html(qweb.render("create_type_modal", {}));
		},
		on_click_create: function (e) {
			var self = this;
			var name = this.$("input[name='name']").val();
			if (name.trim() === "") {
				this.$(".error").css("display", "block");
				return;
			}
			this._rpc({
				model: "todo.type",
				method: "create_type",
				args: [
					{
						name: name
					}
				]
			}).then(function (result) {
				if (result) {
					self.trigger_up("type_added", { task_type: result });
					self.do_notify("success", "Type Created Successfully!");
					self.on_click_cancel();
				}
			});
		},
		on_click_cancel: function (e) {
			this.trigger_up("clear_modal");
		}
	});

	return CreateTypeModalWidget;
});
