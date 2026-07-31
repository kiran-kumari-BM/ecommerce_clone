from database import SessionLocal
import models

# Our original dummy data
DUMMY_PRODUCTS = [
  {
    "title": "Echo Dot (5th Gen) - Smart speaker with Alexa",
    "price": 49.99,
    "description": "Our best-sounding Echo Dot yet. Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room.",
    "category": "Electronics",
    "image": "https://m.media-amazon.com/images/I/71C3oJLfHwL._AC_SX679_.jpg"
  },
  {
    "title": "Men's Classic Cotton T-Shirt",
    "price": 15.00,
    "description": "Comfortable, lightweight cotton t-shirt perfect for everyday wear. Features a seamless collar and double-needle stitching throughout.",
    "category": "Clothing",
    "image": "https://m.media-amazon.com/images/I/61R8N3xX5ZL._AC_UY879_.jpg"
  },
  {
    "title": "Atomic Habits: An Easy & Proven Way to Build Good Habits",
    "price": 11.98,
    "description": "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation.",
    "category": "Books",
    "image": "https://m.media-amazon.com/images/I/81bGKUa1e0L._AC_UY327_FMwebp_QL65_.jpg"
  },
  {
    "title": "10-Piece Glass Food Storage Containers",
    "price": 35.99,
    "description": "Store food safely and securely with these BPA-free glass containers. Microwave, oven, and dishwasher safe.",
    "category": "Home & Kitchen",
    "image": "https://m.media-amazon.com/images/I/717B-WpZ0hL._AC_SX679_.jpg"
  }
]

def seed_database():
    # Open a database session
    db = SessionLocal()
    
    # Check if the table is already populated so we don't insert duplicates
    existing_products = db.query(models.Product).count()
    if existing_products > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding database...")
    
    # Iterate through the array and add each product to the database
    for item in DUMMY_PRODUCTS:
        db_product = models.Product(
            title=item["title"],
            price=item["price"],
            description=item["description"],
            category=item["category"],
            image=item["image"]
        )
        db.add(db_product)
    
    # Commit the transaction to save it permanently
    db.commit()
    db.close()
    
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()