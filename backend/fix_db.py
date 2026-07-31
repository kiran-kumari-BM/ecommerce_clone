from database import engine
from sqlalchemy import text

try:
    # This connects to your Postgres database and forcefully adds the column
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE orders ADD COLUMN address VARCHAR;"))
    print("✅ SUCCESS! The 'address' column has been added to your PostgreSQL database.")
except Exception as e:
    print(f"⚠️ Note: {e}")