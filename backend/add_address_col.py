
from sqlalchemy import text
from database import engine

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE orders ADD COLUMN address TEXT;"))
        conn.commit()
    print("✅ Successfully added 'address' column to the orders table!")
except Exception as e:
    print(f"❌ Error (maybe the column already exists?): {e}")