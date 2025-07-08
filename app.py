import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Import branding config
try:
    from branding_config import SITE_NAME, COMPANY_NAME
except ImportError:
    SITE_NAME = "GotoFast Logistics"
    COMPANY_NAME = "GotoFast Logistics Pvt Ltd"

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "logistics-secret-key-2024")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
app.config['SITE_NAME'] = SITE_NAME
app.config['COMPANY_NAME'] = COMPANY_NAME

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///logistics.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login'

@login_manager.user_loader
def load_user(user_id):
    from models import Admin, DeliveryPartner
    if user_id.startswith('admin_'):
        admin_id = int(user_id.split('_')[1])
        return Admin.query.get(admin_id)
    elif user_id.startswith('partner_'):
        partner_id = int(user_id.split('_')[1])
        return DeliveryPartner.query.get(partner_id)
    return None

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    logging.info("Database tables created successfully")
    
    # Initialize default content
    from routes import initialize_contact_settings
    initialize_contact_settings()
