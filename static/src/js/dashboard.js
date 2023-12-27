odoo.define("todo.dashboard", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const DashboardWidget = Widget.extend({
		init: function (parent, data) {
			this.parent = parent;
			this.data = data;
			this._super(parent);
		},
		start: function () {
			this._super.apply(this, arguments);
			this.$el.html(
				qweb.render("dashboard-overview", {
					today: this.data[0],
					upcoming: this.data[1],
					overdue: this.data[2]
				})
			);
		}
	});

	return DashboardWidget;
});
