from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, User as UserSchema

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
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
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/db-report")
def get_db_report(secret: str):
    """
    TEMPORARY ENDPOINT: Generates a database architecture report.
    """
    if secret != "ReportDBArch2026Secure!":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    from sqlalchemy import create_engine, text
    import os
    
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(DATABASE_URL)
    data = {}
    with engine.connect() as conn:
        data['version'] = conn.execute(text("SELECT version();")).scalar()
        
        schemas = conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')")).fetchall()
        data['schemas'] = [r._mapping['schema_name'] for r in schemas]
        
        tables = conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")).fetchall()
        data['tables'] = {}
        for row in tables:
            m = row._mapping
            schema = m['table_schema']
            table = m['table_name']
            data['tables'][table] = {'columns': [], 'constraints': [], 'fks': []}
            
            cols = conn.execute(text("SELECT column_name, data_type, character_maximum_length, is_nullable, column_default FROM information_schema.columns WHERE table_schema = :s AND table_name = :t ORDER BY ordinal_position"), {"s": schema, "t": table}).fetchall()
            for c in cols:
                cm = c._mapping
                data['tables'][table]['columns'].append({'name': cm['column_name'], 'type': cm['data_type'], 'length': cm['character_maximum_length'], 'nullable': cm['is_nullable'], 'default': cm['column_default']})
            
            consts = conn.execute(text("SELECT tc.constraint_type, tc.constraint_name, kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_schema = :s AND tc.table_name = :t"), {"s": schema, "t": table}).fetchall()
            for c in consts:
                cm = c._mapping
                data['tables'][table]['constraints'].append({'type': cm['constraint_type'], 'name': cm['constraint_name'], 'column': cm['column_name']})
                
            fks = conn.execute(text("SELECT kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = :s AND tc.table_name = :t"), {"s": schema, "t": table}).fetchall()
            for f in fks:
                fm = f._mapping
                data['tables'][table]['fks'].append({'column': fm['column_name'], 'ref_table': fm['foreign_table'], 'ref_column': fm['foreign_column']})
                 
        data['indexes'] = [dict(r._mapping) for r in conn.execute(text("SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'"))]
        data['table_sizes'] = [dict(r._mapping) for r in conn.execute(text("SELECT relname AS table_name, n_live_tup AS rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC"))]

    return data

@router.get("/reset-admin-prod")
def reset_admin_production(secret: str, db: Session = Depends(deps.get_db)):
    """
    TEMPORARY ENDPOINT: Resets the admin user in production.
    """
    if secret != "ResetAdmin2026Secure!":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    from app.models.user_role import UserRole
    email = "admin@auctionpro.com"
    temp_password = "AdminSecurePass123!"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        existing_user.hashed_password = security.get_password_hash(temp_password)
        existing_user.role = UserRole.ADMIN
        existing_user.is_superuser = True
        msg = f"Usuário existente '{email}' atualizado com a senha: {temp_password}"
    else:
        new_user = User(
            email=email,
            hashed_password=security.get_password_hash(temp_password),
            role=UserRole.ADMIN,
            is_superuser=True,
            is_active=True
        )
        db.add(new_user)
        msg = f"Novo usuário admin '{email}' criado com a senha: {temp_password}"
    
    db.commit()
    return {"message": "Success", "details": msg}
