import os
import sys
import logging
from sqlalchemy import create_engine, exc
from sqlalchemy.orm import sessionmaker, scoped_session

# Set up to import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
import app.db.base # Initializes all models to prevent mapper errors
from app.models.user import User
from app.models.user_role import UserRole
from app.core.security import get_password_hash

# Config logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env vars injected by Railway
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    logger.error("DATABASE_URL não definida no ambiente. Verifique as configurações do Railway.")
    sys.exit(1)

# Ensure postgresql:// prefix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionProd = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def reset_admin():
    session = SessionProd()
    try:
        email = "admin@auctionpro.com"
        temp_password = "AdminSecurePass123!"
        hashed_password = get_password_hash(temp_password)

        existing_user = session.query(User).filter(User.email == email).first()

        if existing_user:
            existing_user.hashed_password = hashed_password
            existing_user.role = UserRole.ADMIN
            existing_user.is_superuser = True
            logger.info("Usuário existente atualizado com nova senha e role ADMIN.")
        else:
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                role=UserRole.ADMIN,
                is_superuser=True,
                is_active=True
            )
            session.add(new_user)
            logger.info("Novo usuário admin criado com sucesso.")

        session.commit()
        logger.info(f"Reset concluído. Faça login com {email} e senha: {temp_password}")
    except exc.IntegrityError as e:
        session.rollback()
        logger.error(f"Erro de integridade no banco (ex.: duplicata): {e}")
    except exc.SQLAlchemyError as e:
        session.rollback()
        logger.error(f"Erro no SQLAlchemy: {e}")
    except Exception as e:
        session.rollback()
        logger.error(f"Erro inesperado: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    reset_admin()
