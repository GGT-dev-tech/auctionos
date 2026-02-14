from typing import List, Any
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from pathlib import Path
import os

# Define the email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "user@example.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "admin@auctionos.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(subject: str, recipients: List[EmailStr], body: str):
    """
    Send an email asynchronously.
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
