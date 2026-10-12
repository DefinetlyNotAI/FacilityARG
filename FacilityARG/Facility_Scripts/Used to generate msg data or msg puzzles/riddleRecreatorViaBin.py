import os

PDF_FILENAME = "riddle.pdf"
BIN_FILENAME = "riddle.bin"
RECREATED_PDF = "riddle_recreated.pdf"

def pdf_to_bin(pdf_file, bin_file):
    """Read PDF and save as binary dump."""
    with open(pdf_file, "rb") as f:
        data = f.read()
    with open(bin_file, "wb") as f:
        f.write(data)
    print(f"Binary dump created: {bin_file}")

def bin_to_pdf(bin_file, pdf_file):
    """Read binary dump and reconstruct PDF."""
    with open(bin_file, "rb") as f:
        data = f.read()
    with open(pdf_file, "wb") as f:
        f.write(data)
    print(f"PDF reconstructed: {pdf_file}")

def main():
    print("Choose an option:")
    print("1 - Read PDF and create binary dump")
    print("2 - Reconstruct PDF from binary dump")
    choice = input("Enter 1 or 2: ").strip()

    if choice == "1":
        if not os.path.exists(PDF_FILENAME):
            print(f"PDF file '{PDF_FILENAME}' not found!")
            return
        pdf_to_bin(PDF_FILENAME, BIN_FILENAME)
    elif choice == "2":
        if not os.path.exists(BIN_FILENAME):
            print(f"Binary file '{BIN_FILENAME}' not found!")
            return
        bin_to_pdf(BIN_FILENAME, RECREATED_PDF)
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main()
