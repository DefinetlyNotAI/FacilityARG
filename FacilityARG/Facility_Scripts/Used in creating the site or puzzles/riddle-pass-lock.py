from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader("riddle.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Encrypt with a password (user password = opens file)
writer.encrypt(user_password="bark&rot")

with open("riddle.pdf", "wb") as f:
    writer.write(f)
