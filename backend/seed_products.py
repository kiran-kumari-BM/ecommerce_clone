import requests
from sqlalchemy.orm import Session
from database import engine
from models import Product

def seed_database():
    print("⏳ Fetching 100 products from the internet...")
    
    # We use DummyJSON, a free API that provides 100+ fake products with images
    response = requests.get("https://dummyjson.com/products?limit=0")
    
    if response.status_code != 200:
        print("❌ Failed to fetch products.")
        return
        
    products_data = response.json()["products"]
    
    # Open a connection to your PostgreSQL database
    with Session(engine) as session:
        # Check if we already have products so we don't accidentally add duplicates
        existing_count = session.query(Product).count()
        if existing_count > 0:
            print(f"⚠️ You already have {existing_count} products in your database.")
            choice = input("Do you want to add these 100 ON TOP of what you have? (y/n): ")
            if choice.lower() != 'y':
                print("Canceling seed.")
                return

        print("📦 Pushing products into your database...")
        
        for item in products_data:
            # Match the data to your exact Product model in models.py
            new_product = Product(
                title=item["title"],
                price=float(item["price"]),
                description=item["description"],
                category=item["category"],
                image=item["thumbnail"] # This is a real URL pointing to a product image
            )
            session.add(new_product)
            
        session.commit()
        print("✅ SUCCESS! 100 new products have been added to dummy.zon!")

if __name__ == "__main__":
    seed_database()