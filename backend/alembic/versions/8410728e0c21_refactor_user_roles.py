"""refactor_user_roles

Revision ID: 8410728e0c21
Revises: 28e16d928131
Create Date: 2026-02-28 05:05:54.690228

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8410728e0c21'
down_revision: Union[str, None] = '28e16d928131'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Set default admin
    op.execute("UPDATE users SET role = 'admin', is_superuser = TRUE WHERE email = 'admin@auctionpro.com'")
    # Convert all remaining agents to clients
    op.execute("UPDATE users SET role = 'client' WHERE role = 'agent'")


def downgrade() -> None:
    # Revert client back to agent (lossy, but best effort)
    op.execute("UPDATE users SET role = 'agent' WHERE role = 'client'")
    op.execute("UPDATE users SET role = 'agent', is_superuser = FALSE WHERE email = 'admin@auctionpro.com'")
