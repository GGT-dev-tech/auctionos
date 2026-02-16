"""Add ParcelFair schema manual

Revision ID: d53e38cc2b9f
Revises: ab8d09ddfbb1
Create Date: 2026-02-16 20:00:41.088463

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd53e38cc2b9f'
down_revision: Union[str, None] = 'ab8d09ddfbb1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # 1. Add new columns to properties
    # We check if columns exist before adding to avoid errors if partially applied
    # Note: SQLite doesn't support IF NOT EXISTS for columns in standard syntax easily, 
    # but Alembic context can be used. For simplicitly in this manual script, we'll try/except or just add.
    # However, since this is a fresh migration after a sync, we assume they don't exist in the *current* version metadata.
    
    with op.batch_alter_table('properties') as batch_op:
        batch_op.add_column(sa.Column('polygon', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('inventory_type', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('tax_status', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('next_auction_date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('amount_due', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('legal_description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('owner_name', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('owner_address', sa.String(length=255), nullable=True))
        
        # Add index for next_auction_date
        batch_op.create_index(batch_op.f('ix_properties_next_auction_date'), ['next_auction_date'], unique=False)
        
    # 2. Add new columns to property_details
    with op.batch_alter_table('property_details') as batch_op:
        batch_op.add_column(sa.Column('total_market_value', sa.Float(), nullable=True))

    # 3. Create auctions table
    op.create_table('auctions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('short_name', sa.String(length=255), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('county', sa.String(length=100), nullable=True),
        sa.Column('auction_date', sa.Date(), nullable=True),
        sa.Column('time', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('tax_status', sa.String(length=50), nullable=True),
        sa.Column('parcels_count', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('search_link', sa.String(length=500), nullable=True),
        sa.Column('register_link', sa.String(length=500), nullable=True),
        sa.Column('list_link', sa.String(length=500), nullable=True),
        sa.Column('info_link', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('auctions') as batch_op:
        batch_op.create_index(batch_op.f('ix_auctions_auction_date'), ['auction_date'], unique=False)
        batch_op.create_index(batch_op.f('ix_auctions_county'), ['county'], unique=False)
        batch_op.create_index(batch_op.f('ix_auctions_state'), ['state'], unique=False)

    # 4. Create price_notices table
    op.create_table('price_notices',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('target_price', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('price_notices') as batch_op:
        batch_op.create_index(batch_op.f('ix_price_notices_property_id'), ['property_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_price_notices_user_id'), ['user_id'], unique=False)


def downgrade():
    # 1. Drop price_notices
    with op.batch_alter_table('price_notices') as batch_op:
        batch_op.drop_index(batch_op.f('ix_price_notices_user_id'))
        batch_op.drop_index(batch_op.f('ix_price_notices_property_id'))
    op.drop_table('price_notices')
    
    # 2. Drop auctions
    with op.batch_alter_table('auctions') as batch_op:
        batch_op.drop_index(batch_op.f('ix_auctions_state'))
        batch_op.drop_index(batch_op.f('ix_auctions_county'))
        batch_op.drop_index(batch_op.f('ix_auctions_auction_date'))
    op.drop_table('auctions')

    # 3. Drop columns from property_details
    with op.batch_alter_table('property_details') as batch_op:
        batch_op.drop_column('total_market_value')

    # 4. Drop columns from properties
    with op.batch_alter_table('properties') as batch_op:
        batch_op.drop_index(batch_op.f('ix_properties_next_auction_date'))
        batch_op.drop_column('owner_address')
        batch_op.drop_column('owner_name')
        batch_op.drop_column('legal_description')
        batch_op.drop_column('amount_due')
        batch_op.drop_column('next_auction_date')
        batch_op.drop_column('tax_status')
        batch_op.drop_column('inventory_type')
        batch_op.drop_column('polygon')
