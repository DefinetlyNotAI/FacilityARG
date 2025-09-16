import logging

import colorlog

# ----- Logging Setup -----
log_handler = colorlog.StreamHandler()
log_handler.setFormatter(colorlog.ColoredFormatter(
    "%(log_color)s[%(levelname)s]%(reset)s %(message)s",
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'white',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
))
log = colorlog.getLogger('VESSEL')
log.addHandler(log_handler)
log.setLevel(logging.DEBUG)
