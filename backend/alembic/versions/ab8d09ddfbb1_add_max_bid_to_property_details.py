"""add max_bid to property_details

Revision ID: ab8d09ddfbb1
Revises: 8d02a8a55852
Create Date: 2026-02-14 05:12:14.992264

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab8d09ddfbb1'
down_revision: Union[str, None] = '8d02a8a55852'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('property_details', sa.Column('max_bid', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('property_details', 'max_bid')
