{
    "name": "Todo",
    "version": "1.0",
    "author": "Aayush Shah",
    "category": "Personal",
    "description": """
        A Todo App made using templates
    """,
    "depends": [
        "base",
        "web",
        "website",
    ],
    "qweb": [
        "static/src/xml/todo_components.xml",
    ],
    "data": [
        "views/assets.xml",
        "security/ir.model.access.csv",
        "views/base_template.xml",
        "views/loginform.xml",
        "views/signupform.xml",
        "views/resetpassword.xml",
        "views/menu.xml",
    ],
    "sequence": "-1",
    "installable": True,
    "application": True,
}
