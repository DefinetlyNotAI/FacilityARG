from vessel.colors import Colors, Format
from vessel.handler import Handler
from vessel.logRecreate import ARGLogManager
from vessel.vesselLog import log

# Initialize the Handler with custom settings - These are global settings
# NOTE: return_string_rather_than_print has priority over exit_script both locally and globally!
handler = Handler(
    show_line=True,  # Show the line number where the exception occurred
    trace=True,  # Include the traceback in the output
    use_timestamp=False,  # Add a timestamp to the exception message
    exit_script=False,  # Exit the script after handling the exception
    return_string_rather_than_print=False
    # Return the message instead of printing it,
    # if True it will override/ignore exit_script
)

# Customize the formatter
# NOTE: Specific settings always the defaults,
#       example if message_color is set it will override the main_color for the message part,
handler.formatter(
    main_color=Colors.WHITE,  # Use a neutral main color
    message_color=Colors.WHITE,  # Softer yellow for messages
    trace_color=Colors.CYAN,  # Softer cyan for tracebacks
    trace_format=Format.DIM,  # Dim tracebacks for less emphasis
)
