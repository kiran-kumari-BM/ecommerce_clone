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


# Add 'address' to CheckoutRequest
class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    total_amount: float
    address: str # <--- Add this line