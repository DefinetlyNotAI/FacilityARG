import pikepdf

# PDF file name
filename = "riddle.pdf"

# Open PDF and read metadata
with pikepdf.open(filename, password="bark&rot") as pdf:
    metadata = pdf.docinfo
    print("PDF Metadata:\n")
    for key, value in metadata.items():
        print(f"{key}: {value}")
