"""add_is_favorite_list_to_client_lists

Revision ID: 1a56ef4c2f65
Revises: 8410728e0c21
Create Date: 2026-02-28 05:09:50.592326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a56ef4c2f65'
down_revision: Union[str, None] = '8410728e0c21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column with server default
    op.add_column('client_lists', sa.Column('is_favorite_list', sa.Boolean(), nullable=True, server_default=sa.text('false')))


def downgrade() -> None:
    # Batch alter table to drop column safely in SQLite
    with op.batch_alter_table('client_lists', schema=None) as batch_op:
        batch_op.drop_column('is_favorite_list')
