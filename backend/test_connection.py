from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://climb_admin:3foura11@localhost/climbs_db"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Connection successful:", result.fetchone())
except Exception as e:
    print("Error connecting to the database:", e)
