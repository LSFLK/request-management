from channels.auth import AuthMiddlewareStack
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from rest_framework_jwt.settings import api_settings
from django.contrib.auth import get_user_model

User = get_user_model()
jwt_get_user_handler = api_settings.JWT_PAYLOAD_GET_USER_ID_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER

class TokenAuthMiddleware:
    """
    Token authorization middleware for Django Channels 2
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        try:
            token_name, token_key = scope['query_string'].decode().split("=")
            payload = jwt_decode_handler(token_key)
            
            if payload is not None:
                scope['user'] = User.objects.get(id=payload['user_id'])
            else:
                scope['user'] = None
        except Exception as e:
            scope['user'] = None
            
        return self.inner(scope)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))