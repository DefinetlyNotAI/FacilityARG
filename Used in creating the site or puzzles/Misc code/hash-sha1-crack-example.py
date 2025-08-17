import hashlib
import itertools
import string
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Shared state
found_flag = threading.Event()
found_result = None


def sha1_match(candidate_tuple, target_hash):
    if found_flag.is_set():
        return None
    word = ''.join(candidate_tuple)
    hashed_word = hashlib.sha1(word.encode()).hexdigest()
    if hashed_word == target_hash:
        global found_result
        found_result = word
        found_flag.set()
        print(f"\n✅ Match found: {word}")
        return word
    return None


def crack_sha1_letters(hash_to_crack, min_length=1, max_length=5, max_workers=8):
    letters = string.ascii_lowercase
    global found_result
    found_result = None

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for length in range(min_length, max_length + 1):
            total = len(letters) ** length
            print(f"\nTrying length {length} ({total:,} combinations)...")
            candidates = itertools.product(letters, repeat=length)

            futures = []
            with tqdm(total=total, desc=f"Submitting (len={length})") as submit_bar:
                for cand in candidates:
                    if found_flag.is_set():
                        break
                    futures.append(executor.submit(sha1_match, cand, hash_to_crack))
                    submit_bar.update(1)

            with tqdm(total=len(futures), desc=f"Completing (len={length})") as complete_bar:
                for _ in as_completed(futures):
                    complete_bar.update(1)
                    if found_flag.is_set():
                        break

            if found_flag.is_set():
                break

    return found_result


# Example usage
crack_sha1_letters(
    hash_to_crack="e6d7a4c1389cffecac2b41b4645a305dcc137e81",
    min_length=1,
    max_length=7,
    max_workers=18
)
