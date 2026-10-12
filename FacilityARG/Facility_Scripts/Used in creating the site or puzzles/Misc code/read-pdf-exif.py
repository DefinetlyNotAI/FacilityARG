import pikepdf


def get_pdf_metadata(file_path):
    with pikepdf.open(file_path) as pdf:
        for key, value in pdf.docinfo.items():
            print(f"{key}: {value}")


# Example usage:
get_pdf_metadata("riddle.pdf")
