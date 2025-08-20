import logging

import colorlog

# ----- Logging Setup -----
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
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
log.addHandler(handler)
log.setLevel(logging.DEBUG)
