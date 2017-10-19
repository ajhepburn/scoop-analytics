"""empty message

Revision ID: f98f29d0a6b1
Revises: 
Create Date: 2017-10-19 15:49:13.762450

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f98f29d0a6b1'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('documents')
    op.drop_table('summary')
    op.drop_table('share_prices')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('share_prices',
    sa.Column('exchange', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('symbol', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('timestamp', sa.BIGINT(), autoincrement=False, nullable=False),
    sa.Column('open', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('close', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('high', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('low', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('volume', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('exchange', 'symbol', 'timestamp', name='share_prices_pkey')
    )
    op.create_table('summary',
    sa.Column('exchange', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('symbol', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('summary', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('people', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('name', sa.TEXT(), autoincrement=False, nullable=True),
    sa.Column('cashtag', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('exchange', 'symbol', name='summary_pkey')
    )
    op.create_table('documents',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('type', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('data', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='documents_pkey')
    )
    # ### end Alembic commands ###
