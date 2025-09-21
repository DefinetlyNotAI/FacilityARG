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
    """Displays a styled FATAL ERROR popup for special lore values."""

    @staticmethod
    def trigger(buttons: list[str], title: str, message: str, font: str = "Microsoft Sans Serif") -> str | None:
        """Show the popup if lore is special. Returns the clicked button label or None."""
        # Create the form
        form = WinForms.Form()
        form.Text = title
        form.Size = Size(400, 180)
        form.FormBorderStyle = WinForms.FormBorderStyle.FixedDialog
        form.StartPosition = WinForms.FormStartPosition.CenterScreen
        form.TopMost = True
        form.MaximizeBox = False
        form.MinimizeBox = False

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

            # Define click handler
            def make_click(label_):
                # noinspection PyUnusedLocal
                def click(sender, args):
                    form.Tag = label_
                    form.Close()

                return click

            btn.Click += make_click(text)
            form.Controls.Add(btn)

        # Show modal
        form.ShowDialog()

        return form.Tag  # The label of the clicked button
