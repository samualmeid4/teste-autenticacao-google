from rest_framework import status
from django.conf import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from .models import PerfilEnum, User

# View autenticacao google
class GoogleConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not settings.GOOGLE_CLIENT_ID:
            return Response({'detail': 'GOOGLE_CLIENT_ID nao configurado no backend.'}, status=500)

        return Response({'client_id': settings.GOOGLE_CLIENT_ID})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('credential')

        if not token:
            return Response({'detail': 'Token do Google nao enviado.'}, status=400)

        if not settings.GOOGLE_CLIENT_ID:
            return Response({'detail': 'GOOGLE_CLIENT_ID nao configurado no backend.'}, status=500)

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            return Response({'detail': 'Token do Google invalido.'}, status=400)

        email = idinfo.get('email')

        if not email:
            return Response({'detail': 'Conta Google sem e-mail.'}, status=400)

        username = self.get_available_username(email)

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create_user(
                username=username,
                email=email,
                perfil=PerfilEnum.USUARIO,
            )
            user.set_unusable_password()
            user.save(update_fields=['password'])

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })

    def get_available_username(self, email):
        base_username = email.split('@')[0].strip().replace(' ', '_')
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f'{base_username}_{counter}'
            counter += 1

        return username







class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            }
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
