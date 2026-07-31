from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import engine, get_db
import models
import schemas
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

# Setup
Base = models.Base
Base.metadata.create_all(bind=engine)
app = FastAPI()

SECRET_KEY = "9bf7debe36bda20b632a5e53590088cf00b6a782160887f607686c8399a0d36d"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# --- AUTH UTILS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=60 * 24 * 7)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- ADMIN UTILS ---
def verify_admin(current_user):
    # REPLACE THIS WITH YOUR LOGIN EMAIL
    ADMIN_EMAIL = "kiranmanjunath@example.com" 
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You do not have admin privileges."
        )
    return True

# --- CONFIG ---
razorpay_client = razorpay.Client(auth=("rzp_test_TJll7YzssBvYZ6", "m8TyIg8crQbYdAOpVbY0rHpA"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the dummy.zon API"}

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# --- ADMIN ROUTES (CRUD) ---

@app.post("/api/admin/products")
def create_product(product: schemas.ProductCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    verify_admin(current_user)
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/api/admin/products/{product_id}")
def update_product(product_id: int, product_data: schemas.ProductCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    verify_admin(current_user)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.dict().items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@app.delete("/api/admin/products/{product_id}")
def delete_product(product_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    verify_admin(current_user)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

# --- CHECKOUT & ORDERS ---

@app.post("/api/razorpay/create_order")
def create_razorpay_order(request: schemas.CheckoutRequest):
    amount = int(request.total_amount * 100) 
    order_data = {"amount": amount, "currency": "INR", "receipt": "dummy_zon_receipt_1", "payment_capture": 1}
    razorpay_order = razorpay_client.order.create(data=order_data)
    return {"order_id": razorpay_order["id"]}

@app.post("/api/checkout")
def process_checkout(request: schemas.CheckoutRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not request.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    new_order = models.Order(total_amount=request.total_amount, owner_id=current_user.id, address=request.address)
    db.add(new_order)
    db.commit()
    db.refresh(new_order) 

    for item in request.items:
        order_item = models.OrderItem(order_id=new_order.id, product_id=item.id, price_at_purchase=item.price)
        db.add(order_item)
    db.commit()
    return {"message": "Order processed successfully!", "order_id": new_order.id}

@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Order).filter(models.Order.owner_id == current_user.id).options(joinedload(models.Order.items)).order_by(models.Order.id.desc()).all()

# --- AUTH ROUTES ---

@app.post("/api/signup", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(email=user.email, phone_number=user.phone_number, hashed_password=get_password_hash(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}