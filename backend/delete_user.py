from database import get_db
import models

# Open a session
db = next(get_db())

# Replace this with the email you want to delete
email_to_delete = "1si24ad022@sit.ac.in" 

user = db.query(models.User).filter(models.User.email == email_to_delete).first()

if user:
    db.delete(user)
    db.commit()
    print(f"User {email_to_delete} deleted successfully.")
else:
    print("User not found.")