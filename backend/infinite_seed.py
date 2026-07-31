from faker import Faker
import random
from sqlalchemy.orm import Session
from database import engine
from models import Product

fake = Faker()

def generate_infinite_products(how_many=1000):
    print(f"⏳ Generating {how_many} unique products...")
    
    categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Toys", "Beauty"]
    
    with Session(engine) as session:
        for i in range(how_many):
            # Invent a realistic sounding product name (e.g., "Apex Software")
            product_title = f"{fake.company()} {fake.word().capitalize()}"
            
            new_product = Product(
                title=product_title,
                price=round(random.uniform(10.0, 999.99), 2), # Random price between ₹10 and ₹999
                description=fake.paragraph(nb_sentences=3),   # Random 3-sentence description
                category=random.choice(categories),           # Picks a random category from above
                # Picsum gives us a random, high-quality placeholder image!
                image=f"https://picsum.photos/seed/{random.randint(1, 10000)}/400/400" 
            )
            session.add(new_product)
            
        session.commit()
        print(f"✅ SUCCESS! {how_many} products created and added to your database!")

if __name__ == "__main__":
    # Change the number inside the parentheses to whatever you want!
    generate_infinite_products(500)