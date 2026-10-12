from vessel.exceptionHandler.handler import Handler
from vessel.exceptionHandler.color import Colors
from vessel.exceptionHandler.format import Format

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
    main_color=Colors.WHITE,
    message_color=Colors.WHITE,
    trace_color=Colors.CYAN,
    trace_format=Format.DIM
)

__all__ = ["handler", "Colors", "Format"]
