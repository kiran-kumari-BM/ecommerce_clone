from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    phone_number: Optional[str] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class CheckoutItem(BaseModel):
    id: int
    price: float

class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    total_amount: float

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    total_amount: float
    email: str 
    # Make sure 'address' is NOT here, or make it optional like this:
    # address: str | None = None



class ProductCreate(BaseModel):
    title: str
    price: float
    description: str
    category: str
    image: str



from pydantic import BaseModel
from typing import List

class CartItem(BaseModel):
    id: int
    price: float


class PaymentVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    
    # We still need the cart data to save to the database & send the email
    items: List[CartItem]
    total_amount: float
    email: str 
    # address: str (Optional, depending on if you are sending it from React)