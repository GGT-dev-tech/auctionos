"""add_billing_and_photos

Revision ID: 6d765a06df0e
Revises: 73b3aa8ac4ea
Create Date: 2026-05-01 15:29:44.805999

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d765a06df0e'
down_revision: Union[str, None] = '73b3aa8ac4ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch_alter_table for SQLite compatibility if needed, though Railway is Postgres.
    op.add_column('users', sa.Column('subscription_tier', sa.String(length=50), server_default='trial', nullable=True))
    op.add_column('users', sa.Column('property_searches_used', sa.Integer(), server_default='0', nullable=True))
    op.add_column('property_details', sa.Column('public_photos', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('property_details', 'public_photos')
    op.drop_column('users', 'property_searches_used')
    op.drop_column('users', 'subscription_tier')
