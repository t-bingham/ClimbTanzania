import os
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
from dotenv import load_dotenv
from backend.app.models.add_climb import User  # Ensure all relevant models are imported
from backend.app.db.base import Base  # Make sure Base is imported

# Load environment variables from .env file
load_dotenv()

# Alembic Config object
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# Get the database URL from the environment variable
database_url = os.getenv('DATABASE_URL')
print("DATABASE_URL:", database_url)

# Ensure that the database URL is correctly loaded
if not database_url:
    raise RuntimeError("DATABASE_URL is not set or loaded from .env file")

# Set the target metadata
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(database_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # This ensures Alembic detects changes in types
            compare_server_default=True  # Ensures defaults are correctly compared
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
