from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token


def register_user(db: Session, name: str, email: str, phone: str | None, password: str, role: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("A user with this email already exists")
    user = User(name=name, email=email, phone=phone, password_hash=hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    return create_access_token({"sub": str(user.id), "role": user.role.value, "email": user.email})
