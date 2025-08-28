from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_apscheduler import APScheduler

db = SQLAlchemy()
migrate = Migrate()
scheduler = APScheduler()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from routes.clients import clients_bp
    from routes.reports import reports_bp
    from routes.settings import settings_bp
    from routes.dashboard import dashboard_bp
    from routes.plans import plans_bp
    from routes.radius_sessions import radius_sessions_bp
    from routes.invoices import invoices_bp
    from routes.payments import payments_bp
    from routes.monitoring_routes import monitoring_bp
    from commands import cli_bp

    app.register_blueprint(clients_bp, url_prefix="/api/clients")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(plans_bp, url_prefix="/api/plans")
    app.register_blueprint(radius_sessions_bp, url_prefix="/api")
    app.register_blueprint(invoices_bp, url_prefix="/api")
    app.register_blueprint(payments_bp, url_prefix="/api")
    app.register_blueprint(monitoring_bp, url_prefix="/api/monitoring")
    app.register_blueprint(cli_bp)

    @app.route("/")
    def index():
        return {"message": "✅ Flask + PostgreSQL backend is running"}

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        from services.monitoring import check_client_status
        from services.billing import generate_invoices, check_overdue_invoices # Import the new function
        scheduler.init_app(app)
        scheduler.add_job(id='check_client_status_job', func=check_client_status, trigger='interval', seconds=60)
        scheduler.add_job(id='generate_invoices_job', func=generate_invoices, trigger='interval', days=1) # Schedule invoice generation
        scheduler.add_job(id='check_overdue_invoices_job', func=check_overdue_invoices, trigger='interval', hours=1) # Schedule overdue invoice check
        scheduler.start()
    app.run(debug=True)
