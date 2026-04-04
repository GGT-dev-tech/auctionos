from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

oauth = OAuth()

# Google OAuth Setup
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

# Facebook OAuth Setup
if settings.FACEBOOK_CLIENT_ID and settings.FACEBOOK_CLIENT_SECRET:
    oauth.register(
        name='facebook',
        client_id=settings.FACEBOOK_CLIENT_ID,
        client_secret=settings.FACEBOOK_CLIENT_SECRET,
        access_token_url='https://graph.facebook.com/v16.0/oauth/access_token',
        access_token_params=None,
        authorize_url='https://www.facebook.com/v16.0/dialog/oauth',
        authorize_params=None,
        api_base_url='https://graph.facebook.com/v16.0/',
        client_kwargs={'scope': 'email public_profile'},
    )
