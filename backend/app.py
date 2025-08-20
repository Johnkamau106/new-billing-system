from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

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

    app.register_blueprint(clients_bp, url_prefix="/api/clients")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")
    app.register_blueprint(dashboard_bp)

    @app.route("/")
    def index():
        return {"message": "✅ Flask + PostgreSQL backend is running"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
