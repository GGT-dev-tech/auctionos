"""add_unique_constraint_to_auction_history

Revision ID: d7c29691225d
Revises: c5de3a151c85
Create Date: 2026-02-22 04:47:21.521013

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7c29691225d'
down_revision: Union[str, None] = 'c5de3a151c85'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        'uq_property_auction_history_property_id_name', 
        'property_auction_history', 
        ['property_id', 'auction_name']
    )


def downgrade() -> None:
    op.drop_constraint(
        'uq_property_auction_history_property_id_name', 
        'property_auction_history', 
        type_='unique'
    )
