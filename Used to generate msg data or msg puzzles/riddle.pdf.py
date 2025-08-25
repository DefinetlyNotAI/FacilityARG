from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import pikepdf

# PDF file name
filename = "riddle.pdf"

# PART I – Visible in PDF
visible_riddle = """Two Steps Rise, Two Steps Fall
Twist and turn, to heed the call
Repeat the turn then seal your fate --"""

# PART II – Hidden in metadata
hidden_riddle = """-- A press of power opens the gate
Where silence lives on the very first page
Enter the code to rattle the cage"""


# Step 1: Create the PDF with visible text
def create_pdf(filepath, text):
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    lines = text.strip().split('\n')
    num_lines = len(lines)

    max_font_size = height // (num_lines + 1)  # crude upper bound
    font_name = "Helvetica-Bold"

    for font_size in range(int(max_font_size), 1, -1):
        c.setFont(font_name, font_size)
        max_line_width = max(c.stringWidth(line, font_name, font_size) for line in lines)
        total_text_height = font_size * num_lines

        if max_line_width <= width - 100:
            break

    y_start = (height + total_text_height) / 2 - font_size

    for i, line in enumerate(lines):
        text_width = c.stringWidth(line, font_name, font_size)
        x = (width - text_width) / 2
        y = y_start - i * font_size
        c.drawString(x, y, line)

    c.showPage()
    c.save()


# Step 2: Inject hidden riddle into metadata and encrypt
def add_metadata_and_encrypt(filepath, metadata_dict, password):
    with pikepdf.open(filepath, allow_overwriting_input=True) as pdf:
        for key, value in metadata_dict.items():
            pdf.docinfo[key] = value
        
        pdf.save(
            filepath,
            encryption=pikepdf.Encryption(
                user=password,
                owner=password,
                allow=pikepdf.Permissions(
                    extract=False,
                    print_lowres=False,
                    print_highres=False
                )
            )
        )


# Execution
create_pdf(filename, visible_riddle)
add_metadata_and_encrypt(filename, {
    "/Subject": "Encrypted",
    "/Producer": "The one who narrates all - PRAISE BE",
    "/Creator": "He who weeps thrice but feels twice",
    "/Description": hidden_riddle
}, password="bark&rot")
