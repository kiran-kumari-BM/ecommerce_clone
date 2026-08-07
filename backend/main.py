from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
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
import smtplib
from email.mime.text import MIMEText

load_dotenv()

# Setup
Base = models.Base
Base.metadata.create_all(bind=engine)
app = FastAPI()

# 1. Define the exact URLs that are allowed to talk to your backe
# 1. Define the exact URLs that are allowed to talk to your backend
origins = [
    "https://ecommerce-clone-livid.vercel.app", 
    "https://ecommerce-clone-r62iusvb0-kirankumari-b-ms-projects.vercel.app", # <-- ADD THIS NEW LINK
    "http://localhost:5173",                    
    "http://localhost:3000",                    
    "http://localhost:5174",                    
]

# 2. Add the CORS middleware to your app
# 2. Add the CORS middleware to your app



# 2. Add the CORS middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # The star means "Allow ANY website to connect"
    allow_credentials=False, # Set this to False so the star works!
    allow_methods=["*"], 
    allow_headers=["*"], 
)









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
    ADMIN_EMAIL = "kirankumarimanjunath@gmail.com" 
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You do not have admin privileges."
        )
    return True

# --- EMAIL UTILS ---
def send_confirmation_email(user_email: str, order_id: int, total_amount: float):
    SENDER_EMAIL = "kirankumari767618@gmail.com"  
    SENDER_PASSWORD = "zyef wvwf hxzm ejjx"  

    subject = f"Order Confirmation - dummy.zon Order #{order_id}"
    body = f"""
    Hello!
    
    Thank you for shopping at dummy.zon!
    Your order (ID: {order_id}) has been placed successfully.
    
    Total Amount: ${total_amount:.2f}
    
    We will let you know when your items ship.
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = user_email

    try:
        # CHANGED: We are now using standard SMTP on port 587 instead of SMTP_SSL on 465
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls() # This command encrypts the connection to bypass the firewall
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, user_email, msg.as_string())
        print(f"Email successfully sent to {user_email}")
    except Exception as e:
        print(f"Failed to send email. Error: {e}")

# --- CONFIG ---
razorpay_client = razorpay.Client(auth=("rzp_test_TJll7YzssBvYZ6", "m8TyIg8crQbYdAOpVbY0rHpA"))

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

@app.post("/api/checkout/verify")
def verify_payment_and_checkout(
    request: schemas.PaymentVerificationRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Verify the Razorpay signature
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        # If the signature doesn't match, someone is trying to fake a payment!
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    # 2. If verification passes, save the order to the database
    new_order = models.Order(
        total_amount=request.total_amount, 
        owner_id=1,  # Hardcoded temporarily if user isn't logged in
        address="123 Dummy Street" # Hardcoded temporarily
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order) 

    # Save the individual items
    for item in request.items:
        order_item = models.OrderItem(
            order_id=new_order.id, 
            product_id=item.id, 
            price_at_purchase=item.price
        )
        db.add(order_item)
    db.commit()
    
    # 3. Payment is confirmed and order is saved -> Send the Email!
    background_tasks.add_task(send_confirmation_email, request.email, new_order.id, request.total_amount)
    
    return {"message": "Payment verified and order processed successfully!", "order_id": new_order.id}

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