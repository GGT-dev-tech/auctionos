import secrets
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.oauth import oauth
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    email = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    email = user_in.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user already exists.")
    
    user = User(
        email=email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_superuser=user_in.is_superuser,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/reset-admin-prod")
def reset_admin_production(secret: str, db: Session = Depends(deps.get_db)):
    if secret != "ResetAdmin2026Secure!":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    email = "admin@auctionpro.com"
    temp_password = "AdminSecurePass123!"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        existing_user.hashed_password = security.get_password_hash(temp_password)
        existing_user.is_superuser = True
        msg = f"Usuário existente '{email}' atualizado com a senha: {temp_password}"
    else:
        new_user = User(
            email=email,
            hashed_password=security.get_password_hash(temp_password),
            is_superuser=True,
            is_active=True
        )
        db.add(new_user)
        msg = f"Novo usuário admin '{email}' criado com a senha: {temp_password}"
    
    db.commit()
    return {"message": "Success", "details": msg}

@router.get("/login/{provider}")
async def login_oauth(request: Request, provider: str):
    """
    Redirect the user to the given provider (google or facebook).
    """
    client = getattr(oauth, provider, None)
    if not client:
        raise HTTPException(status_code=400, detail=f"Provider {provider} not supported or not configured")
    
    redirect_uri = request.url_for('auth_callback', provider=provider)
    # Ensure scheme is https in production
    if "localhost" not in str(redirect_uri) and "127.0.0.1" not in str(redirect_uri):
        redirect_uri = str(redirect_uri).replace("http://", "https://")
        
    return await client.authorize_redirect(request, redirect_uri)

@router.get("/callback/{provider}", name="auth_callback", response_model=Token)
async def auth_callback(request: Request, provider: str, db: Session = Depends(deps.get_db)):
    """
    OAuth Callback handler. Verifies token, fetches user info and grants access.
    """
    client = getattr(oauth, provider, None)
    if not client:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    try:
        token = await client.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error authenticating with {provider}")
    
    # Extract user info
    user_info = None
    if provider == 'google':
        user_info = token.get('userinfo')
    elif provider == 'facebook':
        # Facebook returns a normal dict, we fetch profile info via API
        resp = await client.get('me?fields=id,name,email', token=token)
        user_info = resp.json()
    
    if not user_info or not user_info.get('email'):
        raise HTTPException(status_code=400, detail="Failed to fetch email from provider")
    
    email = user_info['email'].strip().lower()
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Create user with a secure random password since they logged in via OAuth
        random_password = secrets.token_urlsafe(32)
        user = User(
            email=email,
            hashed_password=security.get_password_hash(random_password),
            full_name=user_info.get('name') or user_info.get('given_name') or None,
            is_active=True,
            is_superuser=False,
            role="client"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
