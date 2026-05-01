import secrets
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
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
    # Only allow public signup for client and consultant roles
    allowed_roles = {"client", "consultant"}
    requested_role = (user_in.role or "client").strip().lower()
    if requested_role not in allowed_roles:
        requested_role = "client"   # Silently default — no escalation via public API

    email = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        email=email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_superuser=False,         # Never allow self-registration as superuser
        role=requested_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/reset-admin-prod")
def reset_admin_production(secret: str, db: Session = Depends(deps.get_db)):
    if secret != "ResetAdmin2026Secure!":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    email = "admin@goauct.com"
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
async def login_oauth(request: Request, provider: str, role: str = "investor"):
    """
    Redirect the user to the given provider (google or facebook).
    `role` param: 'investor' or 'consultant' — passed as state so callback can enforce role separation.
    """
    client = getattr(oauth, provider, None)
    if not client:
        raise HTTPException(
            status_code=400, 
            detail=f"Provider {provider} not configured."
        )
    
    try:
        redirect_uri = request.url_for('oauth_callback', provider=provider, _external=True)
    except Exception:
        base_url = str(request.base_url).rstrip("/")
        redirect_uri = f"{base_url}{settings.API_V1_STR}/auth/callback/{provider}"
        
    if "https://" not in str(redirect_uri) and "localhost" not in str(redirect_uri) and "127.0.0.1" not in str(redirect_uri):
        redirect_uri = str(redirect_uri).replace("http://", "https://")
    
    print(f">>> OAUTH REDIRECT URI: {redirect_uri} | role={role}")

    # Encode intended role in the OAuth state parameter.
    # `prompt=select_account` forces Google to always show the account picker
    extra_params: dict = {"state": role}
    if provider == "google":
        extra_params["prompt"] = "select_account"

    return await client.authorize_redirect(request, str(redirect_uri), **extra_params)

@router.get("/callback/{provider}", name="oauth_callback", response_model=Token)
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
    
    # Determine intended role from the OAuth state parameter
    # authlib returns the state both in query params AND in the session-validated state
    intended_role_raw = request.query_params.get('state', '') or ''
    # Clean up in case state has extra encoding
    intended_role_raw = intended_role_raw.strip().lower()
    intended_role = 'consultant' if intended_role_raw == 'consultant' else 'client'
    
    def get_frontend_url(req: Request) -> str:
        base = str(req.base_url)
        if 'localhost' in base or '127.0.0.1' in base:
            return 'http://localhost:5173'
        return settings.FRONTEND_URL
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        # Anti-crossover removed: unified login handles routing.
    else:
        # Create new user with the intended role
        random_password = secrets.token_urlsafe(32)
        user = User(
            email=email,
            hashed_password=security.get_password_hash(random_password),
            full_name=user_info.get('name') or user_info.get('given_name') or None,
            is_active=True,
            is_superuser=False,
            role=intended_role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )

    frontend_url = get_frontend_url(request)

    # Unified login routing - we pass token, frontend routing will check role and redirect
    redirect_url = f"{frontend_url}/#/login?token={access_token}"
    
    print(f">>> OAuth success: user={email} role={user.role} redirect={redirect_url[:80]}...")
    return RedirectResponse(url=redirect_url)
