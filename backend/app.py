import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize extensions without an app
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    
    # Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # RADIUS Server Configuration
    app.config['RADIUS_HOST'] = os.environ.get('RADIUS_HOST', '0.0.0.0')
    app.config['RADIUS_AUTH_PORT'] = int(os.environ.get('RADIUS_AUTH_PORT', 1812))
    app.config['RADIUS_ACCT_PORT'] = int(os.environ.get('RADIUS_ACCT_PORT', 1813))
    app.config['RADIUS_SECRET'] = os.environ.get('RADIUS_SECRET', 'testing123')
    app.config['RADIUS_DICTIONARY_PATH'] = os.environ.get('RADIUS_DICTIONARY_PATH', os.path.join(basedir, 'radius_dictionaries/dictionary'))
    app.config['RADIUS_MIKROTIK_DICTIONARY_PATH'] = os.environ.get('RADIUS_MIKROTIK_DICTIONARY_PATH', os.path.join(basedir, 'radius_dictionaries/dictionary.mikrotik'))

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from models import plans, customer # noqa: F401
        from commands import run_radius_command
        # Import and register blueprints
        from routes.customer_routes import customer_bp
        from routes.plan_routes import plan_bp
        app.register_blueprint(plan_bp)
        app.register_blueprint(customer_bp)
        
        # A simple catch-all route to serve the frontend
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def catch_all(path):
            if os.path.exists(os.path.join(app.static_folder, path)):
                return app.send_static_file(path)
            return app.send_static_file('index.html')

        # Register CLI commands
        app.cli.add_command(run_radius_command)

    return app
