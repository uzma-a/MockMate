"""
<<<<<<< HEAD
Django settings for AI Interview System
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
=======
Django settings for your project
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

<<<<<<< HEAD
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', os.getenv('DJANGO_SECRET_KEY', 'django-insecure-change-this-in-production-12345'))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Updated ALLOWED_HOSTS for Railway deployment
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
# Add Railway domain dynamically
if 'RAILWAY_PUBLIC_DOMAIN' in os.environ:
    ALLOWED_HOSTS.append(os.environ['RAILWAY_PUBLIC_DOMAIN'])
# Add wildcard for Railway subdomains
ALLOWED_HOSTS.extend(['.railway.app', '.up.railway.app'])

=======
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.onrender.com',  # Allow all Render domains
    '.vercel.app',    # Allow all Vercel domains
]
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
<<<<<<< HEAD
    # Third party apps
=======
    # Third party
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
    'rest_framework',
    'corsheaders',
    
    # Your apps
<<<<<<< HEAD
    'api',
=======
    'api',  # Change this to your app name
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
<<<<<<< HEAD
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware (must be before CommonMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
=======
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

<<<<<<< HEAD
ROOT_URLCONF = 'mockmate.urls'
=======
ROOT_URLCONF = 'your_project.urls'  # Change to your project name
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'your_project.wsgi.application'  # Change to your project name

<<<<<<< HEAD
=======
# Database
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

<<<<<<< HEAD

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Only add STATICFILES_DIRS if the directory exists
if (BASE_DIR / 'static').exists():
    STATICFILES_DIRS = [
        BASE_DIR / 'static',
    ]

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}


# CORS settings - Updated for Railway + Vercel
cors_origins = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173'
).split(',')

# Add your Vercel frontend domain here
# Example: https://mockmate.vercel.app
if 'VERCEL_FRONTEND_URL' in os.environ:
    cors_origins.append(os.environ['VERCEL_FRONTEND_URL'])

CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins if origin.strip()]

# Allow all origins in development only
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = False  # Set to True if needed for development

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]


# File upload settings - Important for audio file handling
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
FILE_UPLOAD_PERMISSIONS = 0o644


# Create logs directory if it doesn't exist (skip in production)
LOGS_DIR = BASE_DIR / 'logs'
if DEBUG or not os.environ.get('RAILWAY_ENVIRONMENT'):
    LOGS_DIR.mkdir(exist_ok=True)

# Logging configuration - Railway-friendly
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'api': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}


# Gemini API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY and not DEBUG:
    raise ValueError("GEMINI_API_KEY environment variable is required in production")


# Temporary file settings for audio processing
TEMP_FILE_DIR = BASE_DIR / 'temp'
TEMP_FILE_DIR.mkdir(exist_ok=True)


# CSRF settings - Updated for Railway
csrf_origins = os.getenv(
    'CSRF_TRUSTED_ORIGINS',
    'http://localhost:3000,http://localhost:5173'
).split(',')

# Add Railway and Vercel domains
if 'RAILWAY_PUBLIC_DOMAIN' in os.environ:
    csrf_origins.append(f"https://{os.environ['RAILWAY_PUBLIC_DOMAIN']}")

if 'VERCEL_FRONTEND_URL' in os.environ:
    csrf_origins.append(os.environ['VERCEL_FRONTEND_URL'])

CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_origins if origin.strip()]

CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF token
CSRF_COOKIE_SAMESITE = 'Lax'


# Security settings for production (Railway)
if not DEBUG:
    # HTTPS settings
=======
# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== CORS SETTINGS ====================
# CRITICAL: This fixes your CORS error

# Option 1: Allow specific origins (RECOMMENDED for production)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-frontend.vercel.app",  # Replace with your actual Vercel URL
]

# Option 2: For development only - allow all origins (NOT for production)
# Uncomment this if you want to test quickly
CORS_ALLOW_ALL_ORIGINS = True  # CHANGE TO FALSE IN PRODUCTION

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'access-control-allow-origin',
]

# CSRF Settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.onrender.com",
    "https://*.vercel.app",
]

# For APIs, you might want to disable CSRF for certain views
# We'll handle this in views with @csrf_exempt

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

# Security settings for production
if not DEBUG:
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
<<<<<<< HEAD
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Trust Railway proxy headers
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# Session settings
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = False


# Cache configuration (optional, for better performance)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
=======
>>>>>>> 4c2309cc91ab3a7a969daace379b0cb080a7a42c
