odoo.define("todo.navbar", function (require) {
	"use strict";
	var core = require("web.core");
	var Widget = require("web.Widget");
	var qweb = core.qweb;

	const NavbarWidget = Widget.extend({
		init: function (parent) {
			this._super(parent);
			this.user = this.getSession().name;
			this.user = this.user
				.split(" ")
				.map((initial) => initial[0])
				.join("");
		},
		start: function () {
			this.$el.html(qweb.render("main_navbar", { user: this.user }));
		}
	});

	return NavbarWidget;
});
