import os

import chardet

# Unicode EM SPACE character
EM_SPACE = '\u2003'
VALID_EXTENSIONS = {'.txt', '.log'}


def is_binary(file_path):
    """Check if a file is binary."""
    try:
        with open(file_path, 'rb') as file:
            chunk = file.read(1024)
            if b'\0' in chunk:
                return True
        return False
    except Exception as e:
        print(f"[!] Error checking if binary: {file_path} - {e}")
        return True


def detect_encoding(file_path):
    """Detect encoding using chardet."""
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
        return result['encoding']


def replace_emspaces_in_file(file_path):
    if is_binary(file_path):
        return False

    try:
        encoding = detect_encoding(file_path)
        with open(file_path, 'r', encoding=encoding) as f:
            content = f.read()

        if EM_SPACE not in content:
            return False  # Nothing to replace

        new_content = content.replace(EM_SPACE, ' ')

        with open(file_path, 'w', encoding=encoding) as f:
            f.write(new_content)

        return True
    except Exception as e:
        print(f"[!] Failed to process {file_path}: {e}")
        return False


def scan_and_replace_emspaces(root_dir):
    modified_files = []
    for root, _, files in os.walk(root_dir):
        for filename in files:
            _, ext = os.path.splitext(filename)
            if ext.lower() not in VALID_EXTENSIONS:
                continue

            full_path = os.path.join(root, filename)
            if replace_emspaces_in_file(full_path):
                print(f"[✓] Modified: {full_path}")
                modified_files.append(full_path)

    print("\n=== Summary ===")
    if modified_files:
        for f in modified_files:
            print(f"Modified: {f}")
    else:
        print("No files were modified.")


if __name__ == "__main__":
    current_directory = os.path.dirname(os.path.abspath(__file__))
    scan_and_replace_emspaces(current_directory)
