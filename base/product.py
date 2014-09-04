# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'zuvp4036q9zpc!)0sac=qhk!%udh^5dcavrr@lc6c)m41f3nz%'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
TEMPLATE_DEBUG = DEBUG
ALLOWED_HOSTS = '*'

from base.common import *

STATIC_URL = '/contents/static/'
MEDIA_ROOT = '/data/contents/media'

from base.loggers import LOGGING
