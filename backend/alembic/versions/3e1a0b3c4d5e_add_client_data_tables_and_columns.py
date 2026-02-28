"""add_client_data_tables_and_columns

Revision ID: 3e1a0b3c4d5e
Revises: 1a56ef4c2f65
Create Date: 2026-02-28 05:37:28.389685

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e1a0b3c4d5e'
down_revision: Union[str, None] = '1a56ef4c2f65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # Add missing columns to client_lists if they don't exist
    columns = [c['name'] for c in inspector.get_columns('client_lists')]
    with op.batch_alter_table('client_lists', schema=None) as batch_op:
        if 'is_broadcasted' not in columns:
            batch_op.add_column(sa.Column('is_broadcasted', sa.Boolean(), nullable=True, server_default=sa.text('false')))
        if 'tags' not in columns:
            batch_op.add_column(sa.Column('tags', sa.String(length=500), nullable=True))

    # Create client_notes table if it doesn't exist
    if 'client_notes' not in tables:
        op.create_table('client_notes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.Column('note_text', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['property_id'], ['property_details.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_client_notes_id'), 'client_notes', ['id'], unique=False)
        op.create_index(op.f('ix_client_notes_property_id'), 'client_notes', ['property_id'], unique=False)
        op.create_index(op.f('ix_client_notes_user_id'), 'client_notes', ['user_id'], unique=False)

    # Create client_attachments table if it doesn't exist
    if 'client_attachments' not in tables:
        op.create_table('client_attachments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.Column('file_path', sa.String(length=1000), nullable=False),
            sa.Column('filename', sa.String(length=255), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
            sa.ForeignKeyConstraint(['property_id'], ['property_details.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_client_attachments_id'), 'client_attachments', ['id'], unique=False)
        op.create_index(op.f('ix_client_attachments_property_id'), 'client_attachments', ['property_id'], unique=False)
        op.create_index(op.f('ix_client_attachments_user_id'), 'client_attachments', ['user_id'], unique=False)

    # Create client_list_property association table if it doesn't exist
    if 'client_list_property' not in tables:
        op.create_table('client_list_property',
            sa.Column('list_id', sa.Integer(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['list_id'], ['client_lists.id'], ),
            sa.ForeignKeyConstraint(['property_id'], ['property_details.id'], ),
            sa.PrimaryKeyConstraint('list_id', 'property_id')
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'client_list_property' in tables:
        op.drop_table('client_list_property')

    if 'client_attachments' in tables:
        op.drop_index(op.f('ix_client_attachments_user_id'), table_name='client_attachments')
        op.drop_index(op.f('ix_client_attachments_property_id'), table_name='client_attachments')
        op.drop_index(op.f('ix_client_attachments_id'), table_name='client_attachments')
        op.drop_table('client_attachments')

    if 'client_notes' in tables:
        op.drop_index(op.f('ix_client_notes_user_id'), table_name='client_notes')
        op.drop_index(op.f('ix_client_notes_property_id'), table_name='client_notes')
        op.drop_index(op.f('ix_client_notes_id'), table_name='client_notes')
        op.drop_table('client_notes')

    columns = [c['name'] for c in inspector.get_columns('client_lists')]
    with op.batch_alter_table('client_lists', schema=None) as batch_op:
        if 'tags' in columns:
            batch_op.drop_column('tags')
        if 'is_broadcasted' in columns:
            batch_op.drop_column('is_broadcasted')
