from odoo import http, _
from odoo.http import request
from odoo.addons.auth_signup.controllers.main import AuthSignupHome
from odoo.addons.web.controllers.main import SIGN_UP_REQUEST_PARAMS
from odoo.http import request
from odoo.addons.auth_signup.models.res_users import SignupError
from odoo.exceptions import UserError
import logging
import werkzeug

SIGN_UP_REQUEST_PARAMS.update({"dob", "phone", "gender"})


class CustonSignup(AuthSignupHome):
    @http.route("/web/signup", type="http", auth="public", website=True, sitemap=False)
    def web_auth_signup(self, *args, **kw):
        qcontext = self.get_auth_signup_qcontext()

        if not qcontext.get("token") and not qcontext.get("signup_enabled"):
            raise werkzeug.exceptions.NotFound()

        if "error" not in qcontext and request.httprequest.method == "POST":
            try:
                self.do_signup(qcontext)
                # Send an account creation confirmation email
                if qcontext.get("token"):
                    User = request.env["res.users"]
                    user_sudo = User.sudo().search(
                        User._get_login_domain(qcontext.get("login")),
                        order=User._get_login_order(),
                        limit=1,
                    )
                    template = request.env.ref(
                        "auth_signup.mail_template_user_signup_account_created",
                        raise_if_not_found=False,
                    )
                    if user_sudo and template:
                        template.sudo().with_context(
                            lang=user_sudo.lang,
                            auth_login=werkzeug.url_encode(
                                {"auth_login": user_sudo.email}
                            ),
                        ).send_mail(user_sudo.id, force_send=True)
                return self.web_login(*args, **kw)
            except UserError as e:
                qcontext["error"] = e.name or e.value
            except (SignupError, AssertionError) as e:
                if (
                    request.env["res.users"]
                    .sudo()
                    .search([("login", "=", qcontext.get("login"))])
                ):
                    qcontext["error"] = _(
                        "Another user is already registered using this email address."
                    )
                else:
                    qcontext["error"] = _("Could not create a new account.")

        response = request.render("auth_signup.signup", qcontext)
        response.headers["X-Frame-Options"] = "DENY"
        return response

    def do_signup(self, qcontext):
        """Shared helper that creates a res.partner out of a token"""
        values = {
            key: qcontext.get(key)
            for key in (
                "login",
                "name",
                "password",
                "phone",
                "dob",
                "gender",
            )
        }
        if not values:
            raise UserError(_("The form was not properly filled in."))
        if values.get("password") != qcontext.get("confirm_password"):
            raise UserError(_("Passwords do not match; please retype them."))
        supported_lang_codes = [
            code for code, _ in request.env["res.lang"].get_installed()
        ]
        lang = request.context.get("lang", "")
        if lang in supported_lang_codes:
            values["lang"] = lang
        self._signup_with_values(qcontext.get("token"), values)
        request.env.cr.commit()
