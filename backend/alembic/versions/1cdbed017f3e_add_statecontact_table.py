"""Add StateContact table

Revision ID: 1cdbed017f3e
Revises: 9b875f2af7b4
Create Date: 2026-03-09 21:16:56.721234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1cdbed017f3e'
down_revision: Union[str, None] = '9b875f2af7b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop rolled back tables
    with op.batch_alter_table('property_shape_data', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_property_shape_data_category'))
        batch_op.drop_index(batch_op.f('ix_property_shape_data_id'))
        batch_op.drop_index(batch_op.f('ix_property_shape_data_property_id'))
    op.drop_table('property_shape_data')

    # Create State Contacts Table
    state_contacts_table = op.create_table('state_contacts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_state_contacts_id'), 'state_contacts', ['id'], unique=False)
    op.create_index(op.f('ix_state_contacts_state'), 'state_contacts', ['state'], unique=True)

    # Seed Data
    op.bulk_insert(state_contacts_table, [
        {'state': 'Alabama', 'url': 'https://www.revenue.alabama.gov/property-tax/county-offices-appraisal-assessment-records'},
        {'state': 'Alaska', 'url': 'https://www.commerce.alaska.gov/web/dcra/OfficeoftheStateAssessor/TaxJurisdictions.aspx'},
        {'state': 'Arizona', 'url': 'https://azdor.gov/property-tax/assessor-contacts'},
        {'state': 'Arkansas', 'url': 'https://www.dfa.arkansas.gov/office/arkansas-assessment-coordination-division/county-officials'},
        {'state': 'California', 'url': 'https://boe.ca.gov/proptaxes/countycontacts.htm'},
        {'state': 'Colorado', 'url': 'https://dpt.colorado.gov/county-assessors'},
        {'state': 'Connecticut', 'url': 'https://www.vgsi.com/connecticut-online-database'},
        {'state': 'Delaware', 'url': 'https://revenue.delaware.gov/property-tax/ (use por county)'},
        {'state': 'Florida', 'url': 'https://floridarevenue.com/property/Pages/LocalOfficials.aspx'},
        {'state': 'Georgia', 'url': 'https://dor.georgia.gov/property-records-online'},
        {'state': 'Hawaii', 'url': 'https://realproperty.honolulu.gov/ (Honolulu) + outros counties separados'},
        {'state': 'Idaho', 'url': 'https://tax.idaho.gov/contact-us/contact-property-tax'},
        {'state': 'Illinois', 'url': 'https://tax.illinois.gov/localgovernments/property/countyreimbursements/countysupervisorofassessments.html'},
        {'state': 'Indiana', 'url': 'https://www.in.gov/dlgf/local-officials/assessors'},
        {'state': 'Iowa', 'url': 'https://www.iowa-assessors.org/'},
        {'state': 'Kansas', 'url': 'https://www.kscaa.net/county-appraisers'},
        {'state': 'Kentucky', 'url': 'https://revenue.ky.gov/PVANetwork/Pages/default.aspx'},
        {'state': 'Louisiana', 'url': 'https://www.louisianaassessors.org/ (use por parish)'},
        {'state': 'Maine', 'url': 'https://www.vgsi.com/maine-online-database'},
        {'state': 'Maryland', 'url': 'https://dat.maryland.gov/realproperty/Pages/Maryland-Assessment-Offices.aspx'},
        {'state': 'Massachusetts', 'url': 'https://www.vgsi.com/massachusetts-online-database'},
        {'state': 'Michigan', 'url': 'https://www.michigan.gov/taxes/property/forms/instructions/equalization (use por county)'},
        {'state': 'Minnesota', 'url': 'https://www.revenue.wi.gov/Pages/SLF/assessor-messages-home.aspx (use por county)'},
        {'state': 'Mississippi', 'url': 'https://www.dor.ms.gov/property (use por county)'},
        {'state': 'Missouri', 'url': 'https://stc.mo.gov/directories (Assessor PDF)'},
        {'state': 'Montana', 'url': 'https://revenue.mt.gov/property (use por county)'},
        {'state': 'Nebraska', 'url': 'https://revenue.nebraska.gov/PAD/county-assessors-and-parcel-search'},
        {'state': 'Nevada', 'url': 'https://tax.nv.gov/ (use por county)'},
        {'state': 'New Hampshire', 'url': 'https://www.vgsi.com/new-hampshire-online-database'},
        {'state': 'New Jersey', 'url': 'https://www.nj.gov/treasury/taxation/lpt/localtax.shtml'},
        {'state': 'New Mexico', 'url': 'https://www.tax.newmexico.gov/businesses/county-officials'},
        {'state': 'New York', 'url': 'https://www.tax.ny.gov/research/property/regional/regional-offices.htm (use por county)'},
        {'state': 'North Carolina', 'url': 'https://www.ncdor.gov/taxes-forms/property-tax/property-tax-counties/north-carolina-county-assessors-list'},
        {'state': 'North Dakota', 'url': 'https://www.tax.nd.gov/sites/www/files/documents/misc-discuss-folder/directors-of-tax-equalization-and-city-assessors.pdf'},
        {'state': 'Ohio', 'url': 'https://auditor.state.oh.us/ (use por county)'},
        {'state': 'Oklahoma', 'url': 'https://oklahoma.gov/tax/property-tax/assessor-directory.html'},
        {'state': 'Oregon', 'url': 'https://www.oregon.gov/dor/programs/property/pages/county-contact.aspx'},
        {'state': 'Pennsylvania', 'url': 'https://www.revenue.pa.gov/GeneralTaxInformation/PropertyTax/Pages/CountyAssessmentOffices.aspx'},
        {'state': 'Rhode Island', 'url': 'https://www.vgsi.com/rhode-island-online-database'},
        {'state': 'South Carolina', 'url': 'https://www.sccounties.org/association-groups/county-assessors-south-carolina'},
        {'state': 'South Dakota', 'url': 'https://dor.sd.gov/government/director-of-equalization/contact-county-directors-of-equalization'},
        {'state': 'Tennessee', 'url': 'https://www.comptroller.tn.gov/quick-links/tn-property-assessment-data.html'},
        {'state': 'Texas', 'url': 'https://comptroller.texas.gov/taxes/property-tax/county-directory'},
        {'state': 'Utah', 'url': 'https://assessor.utahcounty.gov/ (use por county)'},
        {'state': 'Vermont', 'url': 'https://tax.vermont.gov/lister-assessor'},
        {'state': 'Virginia', 'url': 'https://www.vacomrev.com/ (use por county)'},
        {'state': 'Washington', 'url': 'https://dor.wa.gov/taxes-rates/property-tax/county-assessors'},
        {'state': 'West Virginia', 'url': 'https://tax.wv.gov/Business/PropertyTax/Pages/PropertyTaxCountyAssessors.aspx'},
        {'state': 'Wisconsin', 'url': 'https://www.revenue.wi.gov/Pages/SLF/assessor-messages-home.aspx'},
        {'state': 'Wyoming', 'url': 'https://wyo-prop-div.wyo.gov/contacts/assessor-contacts'},
    ])


def downgrade() -> None:
    with op.batch_alter_table('state_contacts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_state_contacts_state'))
        batch_op.drop_index(batch_op.f('ix_state_contacts_id'))
    op.drop_table('state_contacts')

    op.create_table('property_shape_data',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('property_id', sa.VARCHAR(length=36), nullable=False),
    sa.Column('category', sa.VARCHAR(length=255), nullable=False),
    sa.Column('subcategory', sa.VARCHAR(length=255), nullable=False),
    sa.Column('value', sa.TEXT(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('property_id', 'category', 'subcategory', name=op.f('uq_property_shape_data_cat_subcat'))
    )
    with op.batch_alter_table('property_shape_data', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_property_shape_data_property_id'), ['property_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_property_shape_data_id'), ['id'], unique=False)
        batch_op.create_index(batch_op.f('ix_property_shape_data_category'), ['category'], unique=False)
