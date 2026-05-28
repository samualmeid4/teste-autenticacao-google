from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import PerfilEnum, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'perfil',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'perfil': {'required': False},
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'perfil']
        extra_kwargs = {
            'id': {'read_only': True},
            'username': {'required': False},
            'perfil': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail ja esta cadastrado.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Este nome de usuario ja esta cadastrado.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'As senhas nao conferem.'})

        username = attrs.get('username') or attrs['email'].split('@')[0]
        username = username.strip().replace(' ', '_')

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Este nome de usuario ja esta cadastrado.'})

        attrs['username'] = username
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.setdefault('perfil', PerfilEnum.USUARIO)
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('E-mail ou senha invalidos.') from exc

        authenticated_user = authenticate(username=user.username, password=password)
        if not authenticated_user:
            raise serializers.ValidationError('E-mail ou senha invalidos.')

        attrs['user'] = authenticated_user
        return attrs
