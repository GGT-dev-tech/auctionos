"""add_property_user_overrides

Revision ID: a1b2c3d4e5f6
Revises: 1a56ef4c2f65
Create Date: 2026-05-05 01:55:00.000000

Adds property_user_overrides table implementing the JSONB Override/Merge pattern.
Allows users to customize any property from the global pool privately
without touching the master property_details record.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '1a56ef4c2f65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure property_details.property_id has a formal UNIQUE CONSTRAINT (not just index)
    # so PostgreSQL accepts it as a FK target. We use CREATE UNIQUE INDEX IF NOT EXISTS
    # to avoid errors if it already exists under a different name.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'uq_property_details_property_id'
                  AND conrelid = 'property_details'::regclass
            ) THEN
                ALTER TABLE property_details
                    ADD CONSTRAINT uq_property_details_property_id UNIQUE (property_id);
            END IF;
        END;
        $$;
    """)

    op.create_table(
        'property_user_overrides',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            'user_id',
            sa.Integer(),
            sa.ForeignKey('users.id', ondelete='CASCADE'),
            nullable=False,
        ),
        # FK references property_details.property_id (UUID).
        # The UNIQUE CONSTRAINT above ensures Postgres accepts this FK.
        sa.Column(
            'property_id',
            sa.String(36),
            sa.ForeignKey('property_details.property_id', ondelete='CASCADE'),
            nullable=False,
        ),
        # JSONB stores only the fields the user actually changed (sparse).
        sa.Column('overrides', JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=True,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=True,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        # Enforce one override record per user per property
        sa.UniqueConstraint('user_id', 'property_id',
                            name='uq_override_user_property'),
    )

    # Standard BTree indexes for fast FK lookups
    op.create_index(
        'ix_prop_user_overrides_user_id',
        'property_user_overrides',
        ['user_id'],
    )
    op.create_index(
        'ix_prop_user_overrides_property_id',
        'property_user_overrides',
        ['property_id'],
    )
    # GIN index on JSONB enables fast key-level queries inside the JSON object
    op.create_index(
        'ix_prop_user_overrides_overrides_gin',
        'property_user_overrides',
        ['overrides'],
        postgresql_using='gin',
    )



def downgrade() -> None:
    op.drop_index('ix_prop_user_overrides_overrides_gin',
                  table_name='property_user_overrides')
    op.drop_index('ix_prop_user_overrides_property_id',
                  table_name='property_user_overrides')
    op.drop_index('ix_prop_user_overrides_user_id',
                  table_name='property_user_overrides')
    op.drop_table('property_user_overrides')
