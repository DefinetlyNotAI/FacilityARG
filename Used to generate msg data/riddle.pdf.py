from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import pikepdf

# PDF file name
filename = "../Facility Site/file console/riddle.pdf"

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

    # Estimate maximum font size that can fit 3 lines
    max_font_size = height // (num_lines + 1)  # crude upper bound
    font_name = "Helvetica-Bold"

    # Try from max size downward until it fits width
    for font_size in range(int(max_font_size), 1, -1):
        c.setFont(font_name, font_size)
        max_line_width = max(c.stringWidth(line, font_name, font_size) for line in lines)
        total_text_height = font_size * num_lines

        if max_line_width <= width - 100:  # margin of 50px on each side
            break

    # Calculate vertical start position to center
    y_start = (height + total_text_height) / 2 - font_size

    # Draw each line centered
    for i, line in enumerate(lines):
        text_width = c.stringWidth(line, font_name, font_size)
        x = (width - text_width) / 2
        y = y_start - i * font_size
        c.drawString(x, y, line)

    c.showPage()
    c.save()


# Step 2: Inject hidden riddle into metadata
def add_metadata(filepath, metadata_dict):
    with pikepdf.open(filepath, allow_overwriting_input=True) as pdf:
        for key, value in metadata_dict.items():
            pdf.docinfo[key] = value
        pdf.save(filepath)


# Execution
create_pdf(filename, visible_riddle)
add_metadata(filename, {
    "/Subject": "Encrypted",
    "/Producer": "The one who narrates all - PRAISE BE",
    "/Creator": "He who weeps thrice but feels twice",
    "/Description": hidden_riddle
})
