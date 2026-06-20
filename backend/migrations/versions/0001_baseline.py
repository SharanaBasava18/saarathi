"""baseline schema for saarathi

Revision ID: 0001_baseline
Revises:
Create Date: 2026-06-20
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "csc_operators",
        sa.Column("operator_id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False, unique=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("district", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_csc_operators_operator_id", "csc_operators", ["operator_id"])
    op.create_index("ix_csc_operators_phone", "csc_operators", ["phone"])
    op.create_index("ix_csc_operators_district", "csc_operators", ["district"])

    op.create_table(
        "citizen_requests",
        sa.Column("request_id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("village", sa.String(length=255), nullable=False),
        sa.Column("district", sa.String(length=255), nullable=False),
        sa.Column("occupation", sa.String(length=255), nullable=False),
        sa.Column("recommended_schemes_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("assigned_operator_id", sa.String(length=64), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="Pending"),
        sa.Column("schedule_type", sa.String(length=32), nullable=True),
        sa.Column("appointment_time", sa.String(length=64), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_citizen_requests_request_id", "citizen_requests", ["request_id"])
    op.create_index("ix_citizen_requests_assigned_operator_id", "citizen_requests", ["assigned_operator_id"])
    op.create_index("ix_citizen_requests_district", "citizen_requests", ["district"])


def downgrade() -> None:
    op.drop_index("ix_citizen_requests_district", table_name="citizen_requests")
    op.drop_index("ix_citizen_requests_assigned_operator_id", table_name="citizen_requests")
    op.drop_index("ix_citizen_requests_request_id", table_name="citizen_requests")
    op.drop_table("citizen_requests")

    op.drop_index("ix_csc_operators_district", table_name="csc_operators")
    op.drop_index("ix_csc_operators_phone", table_name="csc_operators")
    op.drop_index("ix_csc_operators_operator_id", table_name="csc_operators")
    op.drop_table("csc_operators")
