import os


def rename_txt_to_log():
    count = 0
    for filename in os.listdir(''):
        if filename.endswith('.txt'):
            new_name = filename[:-4] + '.log'
            os.rename(filename, new_name)
            print(f"Renamed: {filename} → {new_name}")
            count += 1

    if count == 0:
        print("No .txt files found.")
    else:
        print(f"✔ Renamed {count} file(s).")


if __name__ == "__main__":
    rename_txt_to_log()
