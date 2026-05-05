"""merge_heads_overrides_and_activity_logs

Revision ID: 675537ce7a0f
Revises: a1b2c3d4e5f6, ffa41ad5e5f6
Create Date: 2026-05-05 01:31:44.476877

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '675537ce7a0f'
down_revision: Union[str, None] = ('a1b2c3d4e5f6', 'ffa41ad5e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
