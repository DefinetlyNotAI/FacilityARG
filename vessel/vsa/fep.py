import threading
import queue

import clr

# Add references to Windows Forms and Drawing
# noinspection PyUnresolvedReferences
clr.AddReference("System.Windows.Forms")
# noinspection PyUnresolvedReferences
clr.AddReference("System.Drawing")

# noinspection PyUnresolvedReferences
import System.Windows.Forms as WinForms
# noinspection PyUnresolvedReferences
from System.Drawing import Size, Point, Font, SystemIcons


class FatalErrorPopup:
    """Thread-safe Windows Forms FATAL ERROR popup."""

    @staticmethod
    def trigger(buttons: list[str], title: str, message: str, font: str = "Microsoft Sans Serif") -> str | None:
        """
        Show the popup in a separate thread and return the clicked button label.
        Blocks until user clicks a button.
        """

        result_queue = queue.Queue()

        def _popup_thread():
            form = WinForms.Form()
            form.Text = title
            form.Size = Size(400, 180)
            form.FormBorderStyle = WinForms.FormBorderStyle.FixedDialog
            form.StartPosition = WinForms.FormStartPosition.CenterScreen
            form.TopMost = True
            form.MaximizeBox = False
            form.MinimizeBox = False

            # Disable the X button
            form.FormClosing += lambda s, e: setattr(e, "Cancel", True)

            # Red error icon
            icon = WinForms.PictureBox()
            icon.SizeMode = WinForms.PictureBoxSizeMode.StretchImage
            icon.Image = SystemIcons.Error.ToBitmap()
            icon.Location = Point(20, 20)
            icon.Size = Size(32, 32)
            form.Controls.Add(icon)

            # Message label
            label = WinForms.Label()
            label.Text = message
            label.Location = Point(70, 20)
            label.Size = Size(300, 80)
            label.Font = Font(font, 10)
            form.Controls.Add(label)

            # Dynamically create buttons
            button_width = 75
            button_height = 25
            spacing = 20
            total_width = len(buttons) * button_width + (len(buttons) - 1) * spacing
            start_x = (form.ClientSize.Width - total_width) // 2
            y_pos = 110

            for i, text in enumerate(buttons):
                btn = WinForms.Button()
                btn.Text = text
                btn.Size = Size(button_width, button_height)
                btn.Location = Point(start_x + i * (button_width + spacing), y_pos)

                # Closure to capture text
                def make_click(label_):
                    def click(sender, args):
                        form.Tag = label_
                        WinForms.Application.ExitThread()  # End the Application.Run loop
                    return click

                btn.Click += make_click(text)
                form.Controls.Add(btn)

            # Start the message loop
            WinForms.Application.Run(form)

            # Put result in queue
            result_queue.put(form.Tag)

        thread = threading.Thread(target=_popup_thread, daemon=True)
        thread.start()
        thread.join()
        return result_queue.get()
