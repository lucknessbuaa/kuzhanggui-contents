import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

LOGIN_URL= "/welcome"

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ajax_upload',
    'base',
    #'DjangoUeditor',
    'tastypie',
    'ckeditor',
    'contents',
    'django_tables2',
)


MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    #'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'oauth2_provider.middleware.OAuth2TokenMiddleware',
)

ROOT_URLCONF = 'base.urls'

WSGI_APPLICATION = 'base.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django_mysqlpool.backends.mysqlpool',
        'NAME': 'contents',
        'USER': 'root',
        'PASSWORD': 'nameLR9969',
        'HOST': 'localhost',
        'PORT': '3306'
    }
} 

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = False



STATIC_URL = '/contents/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_URL = '/contents/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "assets"),
)

TEMPLATE_DIRS = (
    os.path.join(BASE_DIR, "templates"),
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.request"
)

CKEDITOR_UPLOAD_PATH = MEDIA_ROOT +'/ckeditor/'

CKEDITOR_CONFIGS = { 
    'default': {
        'toolbar': [
            ['Cut','Copy','Paste','PasteText','PasteFromWord','-'],    
            ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],    
            ['Bold','Italic','Underline','Strike','-'],    
            ['NumberedList','BulletedList','-','Blockquote'],    
            ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],    
            ['Link','Unlink'],    
            ['Image','Flash','HorizontalRule','Smiley','SpecialChar','TextColor','BGColor'],                     ['Styles','Format','Font','FontSize'],
            ['Maximize','ShowBlocks','Preview','Source'],
        ],    
        'language': 'zh-cn',
        'width': 760,
        'height': 300,
        'image_previewText': 'image',
        'toolbarCanCollapse': False,
    },    
    'awesome_ckeditor': {
        'toolbar': 'Basic', 
    },    
}

