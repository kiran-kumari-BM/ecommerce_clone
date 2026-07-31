# Create a file called seed_db.py
from database import SessionLocal
from models import Product

db = SessionLocal()
products = [
    Product(title="Echo Dot", price=49.99, description="Smart speaker", category="Electronics", image="..."),
    Product(title="T-Shirt", price=15.00, description="Cotton tee", category="Clothing", image="...")
]
db.add_all(products)
db.commit()
print("Data seeded!")