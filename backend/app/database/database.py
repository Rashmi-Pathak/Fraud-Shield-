import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite if not provided, adjusted path for running from backend root
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/fraudshield.db")

# In SQLite, checking same thread is needed if using multiple threads
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema():
    """Create new tables and add nullable registry columns to existing SQLite databases."""
    Base.metadata.create_all(bind=engine)
    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        return
    columns = {column["name"] for column in inspect(engine).get_columns("model_versions")}
    additions = {
        "false_positive_rate": "FLOAT",
        "validation_passed": "BOOLEAN",
    }
    missing = {name: definition for name, definition in additions.items() if name not in columns}
    if missing:
        with engine.begin() as connection:
            for name, definition in missing.items():
                connection.execute(text(f"ALTER TABLE model_versions ADD COLUMN {name} {definition}"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
