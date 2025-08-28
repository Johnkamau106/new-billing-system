"""Empty migration to refresh Alembic

Revision ID: cba61f0d8488
Revises: 863525d8f5fe
Create Date: 2025-08-28 10:57:41.480359

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cba61f0d8488'
down_revision = '863525d8f5fe'
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
