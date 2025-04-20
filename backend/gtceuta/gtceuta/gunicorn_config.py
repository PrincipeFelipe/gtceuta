# gunicorn_config.py
bind = "127.0.0.1:8000"
workers = 3
errorlog = '/var/log/gunicorn/gtceuta_error.log'
accesslog = '/var/log/gunicorn/gtceuta_access.log'
capture_output = True
loglevel = "info"