## per https://medium.com/@srijan.pydev_21998/complete-guide-to-deploy-django-applications-on-aws-ubuntu-16-04-instance-with-uwsgi-and-nginx-b9929da7b716

from .base import *

DEBUG = False

# Logging Settings

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'filters': None,
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}

