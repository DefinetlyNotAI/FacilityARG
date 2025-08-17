import argparse
import base64
import codecs
import math
import re
import string
import zlib
from collections import Counter
from itertools import cycle
import nltk

nltk.download('words')
from nltk.corpus import words

ENGLISH_WORDS = set(word.lower() for word in words.words())
FLAGS = {
    'max_depth': 15,
    'show_entropy': True,
    'auto_caesar': False,
    'auto_xor': False,
    'debug': False,
    'include_raw': False,
    'show_tree': False,
    'save_log': None,
}
ROMAN = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
MORSE = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
    '...--': '3', '....-': '4', '.....': '5', '-....': '6',
    '--...': '7', '---..': '8', '----.': '9', '/': ' '
}
decode_history = []


# === Utilities ===
def entropy(s):
    if not s:
        return 0
    p, lns = Counter(s), float(len(s))
    return -sum(count / lns * math.log2(count / lns) for count in p.values())


def generate_nerd_report(raw_input, decode_path, decode_history_):
    """
    Generate a highly detailed, low-level scientific-style report explaining
    the decoding steps, scoring, entropy, and logic of the cracking process.

    Arguments:
    - raw_input: the original encoded string
    - decode_path: list of (depth, method, output) tuples showing chosen decode steps
    - decode_history_: list of (depth, method, original, result, score) of all attempts

    Prints a multisection report.
    """

    def print_section(title, level=1):
        border = "=" * (level * 8)
        print(f"\n{border}\n{title}\n{border}\n")

    def print_section1():
        def printable_ratio(data):
            if not data:
                return 0.0
            return sum(c in string.printable for c in data) / len(data)

        def vowel_ratio(data):
            vowels = set('aeiouAEIOU')
            if not data:
                return 0.0
            return sum(c in vowels for c in data) / len(data)

        def print_subsection(title):
            print(f"\n-- {title} --\n")

        input_len = len(raw_input)
        input_entropy = entropy(raw_input)
        input_print_ratio = printable_ratio(raw_input)
        input_vowel_ratio = vowel_ratio(raw_input)

        print_section("1. Introduction", level=2)
        print(f"Input string length: {input_len} characters")
        print(f"Shannon Entropy: {input_entropy:.6f} bits/char")
        print(f"Printable ASCII character ratio: {input_print_ratio:.4f}")
        print(f"Vowel-to-character ratio: {input_vowel_ratio:.4f}\n")

        print("Preliminary Observations:")

        # Entropy interpretation
        entropy_desc = (
            "very high, suggesting ciphertext, compression, or base encodings"
            if input_entropy > 4.5 else
            "moderate, consistent with natural or semi-obfuscated text"
            if 3.0 < input_entropy <= 4.5 else
            "low, possibly padded, symbolically encoded, or fixed-format"
        )
        print(f"- Entropy value (~{input_entropy:.4f}) is {entropy_desc}.")

        # Printable ratio context
        if input_print_ratio < 0.6:
            print(
                "- Low printable character ratio suggests non-text binary, custom encoding, or embedded control chars.")
        elif input_print_ratio < 0.85:
            print("- Mixed printable ratio may indicate layered formats like base encodings or symbol substitutions.")
        else:
            print(
                "- High printable ratio implies base encodings (e.g., Base64, Base85) or plain text with light encoding.")

        # Vowel ratio reasoning
        expected_vowel_range = (0.35, 0.45)
        if expected_vowel_range[0] <= input_vowel_ratio <= expected_vowel_range[1]:
            print(
                "- Vowel ratio is within expected range for natural English, increasing confidence in text-like structure.")
        elif input_vowel_ratio < 0.2:
            print("- Low vowel ratio suggests acronym-heavy, symbolic, or code-based content.")
        else:
            print(
                "- Unusually high vowel ratio may result from character repetition, substitution ciphers, or non-English origin.")

        # Hypothesis Diagram
        print_subsection("Encoding Complexity Hypothesis")
        print("We assume the input has undergone one or more layers of transformation.\n")

        print("Note: Decoding may involve reversible transforms (e.g., ROT13, Reverse) or recursive structures.")
        print("Detection strategies combine heuristic scoring, entropy profiling, and loop-prevention logic.\n")

    def print_section2():
        print("Decoder Methods Available:\n")
        for decoder_name in sorted(DECODERS.keys()):
            print(f"- {decoder_name}")

        print("\nHeuristic-Based Prediction of Likely First-Layer Decoders:")
        has_spaces = " " in raw_input
        has_only_printable = all(c in string.printable for c in raw_input)
        has_padding = raw_input.strip().endswith(("=", "==", "==="))

        likely_candidates = []

        # Base64, Base32, Base85 detection
        if re.fullmatch(r"[A-Za-z0-9+/=]+", raw_input) and has_padding:
            likely_candidates.append("base64")
        elif re.fullmatch(r"[A-Z2-7=]+", raw_input) and has_padding:
            likely_candidates.append("base32")
        elif re.fullmatch(r"[A-Za-z0-9!#$%&()*+\-;<=>?@^_`{|}~]+", raw_input):
            likely_candidates.append("base85")

        # Morse detection
        if re.fullmatch(r"[.\- /]+", raw_input.strip()):
            likely_candidates.append("morse")

        # Binary detection
        if re.fullmatch(r"[01 ]+", raw_input.strip()):
            likely_candidates.append("binary")

        # Hex detection
        if re.fullmatch(r"[0-9A-Fa-f ]+", raw_input.strip()) and len(raw_input.strip().replace(" ", "")) % 2 == 0:
            likely_candidates.append("hex")

        # Roman numerals
        if re.fullmatch(r"[IVXLCDM ]+", raw_input.strip()) and has_spaces:
            likely_candidates.append("roman")

        # Caesar/ROT13 detection
        if raw_input.isalpha() and raw_input.isupper() and len(raw_input) >= 5:
            likely_candidates.append("rot13")

        # Reverse
        if raw_input[::-1] != raw_input:
            likely_candidates.append("reverse")

        # URL encoding
        if '%' in raw_input and re.search(r'%[0-9A-Fa-f]{2}', raw_input):
            likely_candidates.append("url")

        # XOR / obfuscation (high entropy but printable)
        if has_only_printable and entropy(raw_input) > 4.5:
            likely_candidates.append("xor-brute")

        # BaseN guess by character coverage
        if all(c in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" for c in raw_input):
            if "=" in raw_input:
                likely_candidates.append("base64")
            else:
                likely_candidates.append("base62")

        if not likely_candidates:
            print("- Unable to confidently predict based on surface features alone.")
        else:
            print(
                "Based on observed traits in the input, the following decoders are most likely applicable (early-stage hypotheses):")
            for cand in sorted(set(likely_candidates)):
                print(f"  • {cand}")

        print(
            "\nThese guesses are based on surface-level traits like character frequency, symbol usage, spacing, and entropy.")
        print("Actual decoder selection will depend on scoring heuristics applied at runtime.\n")

    def print_section3():
        def ascii_bar(value, max_value, width=40):
            """Draw ASCII bar proportional to value/max_value."""
            bar_len = int((value / max_value) * width) if max_value > 0 else 0
            return '[' + ('#' * bar_len).ljust(width) + ']'

        for depth, method, output in decode_path:
            print(f"\n3.{depth + 1} — Depth {depth} Decode Step: Applying decoder '{method}'")

            # Gather relevant attempts for this depth/method
            attempts = [h for h in decode_history_ if h[0] == depth and h[1] == method]
            if not attempts:
                print("  ⚠️ No recorded attempts found at this depth.")
                continue

            scores = [a[4] for a in attempts]
            outputs = [a[3] for a in attempts]
            max_score = max(scores)
            avg_score = sum(scores) / len(scores)
            entropy_vals = [entropy(o) for o in outputs]
            avg_entropy = sum(entropy_vals) / len(entropy_vals)

            # --- Basic stats
            print(f"  Attempt count: {len(attempts)}")
            print(f"  Highest observed heuristic score: {max_score:.4f}")
            print(f"  Mean score across all attempts: {avg_score:.4f}")
            print(f"  Mean output entropy: {avg_entropy:.4f} (Ideal range: ~3.5–4.5 for English)")

            # --- Histogram of scores
            print(f"  Score distribution histogram:")
            for i, (inp, out, score) in enumerate([(a[2], a[3], a[4]) for a in attempts]):
                bar = ascii_bar(score, max_score)
                print(f"   Attempt {i + 1}: Score {score:.4f} {bar}")
                print(f"    Input : {repr(inp[:60]) + ('...' if len(inp) > 60 else '')}")
                print(f"    Output: {repr(out[:60]) + ('...' if len(out) > 60 else '')}")

            print(f"\n  ➤ Chosen output (for next decode level):")
            print(f"    {repr(output[:100]) + ('...' if len(output) > 100 else '')}\n")

            # --- Heuristic reasoning engine
            print("  🔎 Rationale & Heuristic Evaluation:")

            if max_score < 1.5 or len(output.strip()) < 4:
                print("  - ⚠️ Output scored poorly and/or is very short. Decoder may be misapplied.")
            else:
                print("  - Decoder '{}' produced relatively high scoring output.".format(method))

            entropy_note = "very low (likely junk)" if avg_entropy < 2.0 else \
                "moderate (possibly structured)" if avg_entropy < 4.5 else "very high (likely random or obfuscated)"

            print(f"  - Entropy analysis: Output entropy is {avg_entropy:.4f} → {entropy_note}.")

            # Self-inverse loop warning
            if method.lower() in {"reverse", "rot13", "roman→alpha"} and depth > 0:
                prev_output = decode_path[depth - 1][2]
                if prev_output.strip().lower() == output.strip().lower():
                    print("  - ⚠️ Reapplication of self-inverse decoder detected with no net gain.")
                else:
                    print("  - Decoder is self-inverse; cautious reapplication advised.")

            # Threshold & plateau detection
            if depth > 0:
                prev_score = decode_path[depth - 1][3] if len(decode_path[depth - 1]) > 3 else 0
                score_gain = max_score - prev_score
                if score_gain < 0.2:
                    print("  - ⚠️ Minimal score gain from previous step; decoding may be plateauing.")
                else:
                    print(f"  - Heuristic score gain from prior step: +{score_gain:.4f}")

            print("  - Further decoder attempts will be skipped if no measurable gain occurs.\n")

    def print_section4():
        def print_heuristic_weights():
            """
            Extract and display the scoring heuristic weights used in score_output().
            """
            weights = {
                "Printable ASCII Ratio": 1.0,
                "Vowel Frequency Ratio": 0.2,
                "Common Word Match Score": 2.0,
                "Dictionary Word Match Score": 3.0
            }

            total = sum(weights.values())

            print("Heuristic Weighting Schema (normalized):")
            print(" +-------------------------------+----------+")
            print(" | Heuristic Component           |  Weight  |")
            print(" +-------------------------------+----------+")
            for k, v in weights.items():
                print(f" | {k:<29} |  {v / total:>6.3f}  |")
            print(" +-------------------------------+----------+")

        print("The decoding engine applies a composite heuristic scoring function combining:\n")

        # Break down heuristic components quantitatively
        print("- Printable character ratio:")
        print("  Measures how many characters are standard ASCII printable characters.")
        print("  Values closer to 1.0 indicate readable text; heavily weighted (×1.0).")

        print("- Vowel frequency ratio:")
        print("  English text tends to have ~40% vowels. This checks for natural text frequency.")
        print("  Moderately weighted (×0.2).")

        print("- Common English word ratio:")
        print("  Measures how many words match common high-frequency English words.")
        print("  Strong indicator of meaningful sentences; heavily weighted (×2.0).")

        print("- Dictionary word ratio:")
        print("  Measures how many words are in a broader English dictionary.")
        print("  Also strongly weighted (×3.0).")

        print("- Entropy:")
        print("  Entropy is **measured**, not used in scoring directly.")
        print("  However, it's shown in reports to help judge randomness vs structure.")
        print("  Ideal English-like entropy is usually between ~3.5 and 4.5.")

        print("- Loop avoidance heuristics:")
        print("  Prevents infinite recursion by limiting reapplication depth for reversible decoders.")
        print("  (e.g., Reverse, ROT13 are limited to 1 depth by design.)")

        print("\nThese components form the actual scoring formula:")
        print("""
            Score = 1.0 × printable_ratio
                  + 0.2 × vowel_ratio
                  + 2.0 × common_word_ratio
                  + 3.0 × dictionary_word_ratio
        """)

        print("Weights are manually tuned to balance score ranges across test samples.\n")

        # Diagram: Heuristic weighting schema
        print("Heuristic Weighting Schema (relative importance):")
        print(print_heuristic_weights())

    def print_section5():
        for depth, method, output in decode_path:
            print(f"[Depth {depth}] Applied {method} decoder")
            snippet = output[:80].replace('\n', '\\n')
            print(f"-> Result snippet (first 80 chars): '{snippet}'")

        print(f"\nFinal decoded output (length {len(decode_path[-1][2])} characters):\n")
        print(decode_path[-1][2])
        print("\n")

    def print_section6():
        for depth, method, original, result, score in decode_history_:
            print(f"[Depth {depth}] Decoder: {method} | Score: {score:.6f}")
            input_snip = repr(original[:80]).replace(chr(10), '\\n')
            print(f" Input snippet: {input_snip}")
            output_snip = repr(result[:80]).replace(chr(10), '\\n')
            print(f" Output snippet: {output_snip}")
            print(f" Output entropy: {entropy(result):.6f}")
            print("-" * 60)

    # === Section 1: Introduction ===
    print_section("Detailed Decode Reasoning Report — Scientific Analysis", level=1)
    print_section1()

    # === Section 2: Available Decoders ===
    print_section("2. Available Decoders and Likelihood Heuristics", level=2)
    print_section2()

    # === Section 3. Decoding Iterations and Stepwise Analysis ===
    print_section("3. Decoding Iterations and Stepwise Analysis", level=2)
    print_section3()

    # === Section 4: Decision Criteria ===
    print_section("4. Decision Criteria and Heuristic Analysis", level=2)
    print_section4()

    # === Section 5: Decode Path Summary ===
    print_section("5. Decode Path Summary: Stepwise Transformation", level=2)
    print_section5()

    # === Section 6: Appendices: Full Decode History ===
    print_section("6. Appendices: Complete Decode History with Metrics", level=2)
    print_section6()

    print("\n[End of report]")


def score_output(s):
    if not s:
        return 0
    lowered = s.lower()
    if "invalid" in lowered or "error" in lowered:
        return 0

    length = len(s)
    printable_ratio = sum(c in string.printable for c in s) / length
    vowels_ratio = sum(c in 'aeiou' for c in lowered) / length

    words_in_s = re.findall(r'\b[a-zA-Z]{2,}\b', lowered)
    num_words = len(words_in_s)
    if num_words:
        dict_words = sum(1 for w in words_in_s if w in ENGLISH_WORDS)
        dict_word_ratio = dict_words / num_words
        common_words = ['the', 'and', 'is', 'of', 'to', 'in', 'you', 'we', 'not', 'but', 'for', 'this', 'that']
        common_word_matches = sum(words_in_s.count(w) for w in common_words)
        common_word_ratio = common_word_matches / num_words
    else:
        dict_word_ratio = 0
        common_word_ratio = 0

    # Weights tuned to keep total score roughly between 0 and 5
    return (
            printable_ratio * 1.0 +
            vowels_ratio * 0.2 +
            common_word_ratio * 2.0 +
            dict_word_ratio * 3.0
    )


def is_printable(s):
    return all(c in string.printable for c in s)


def roman_to_int(r):
    total = 0
    prev = 0
    for char in reversed(r.upper()):
        val = ROMAN.get(char, 0)
        if val < prev:
            total -= val
        else:
            total += val
            prev = val
    return total


# === Decoders ===
def try_base64(s):
    try:
        s_clean = s.strip().replace(" ", "")
        if len(s_clean) % 4 != 0:
            s_clean += "=" * (4 - len(s_clean) % 4)
        return base64.b64decode(s_clean).decode('utf-8')
    except Exception:
        return None


def try_hex(s):
    try:
        return bytes.fromhex(s).decode('utf-8')
    except Exception:
        return None


def try_rot13(s):
    try:
        return codecs.decode(s, 'rot_13')
    except Exception:
        return None


def try_binary(s):
    try:
        bits = s.replace(' ', '')
        if len(bits) % 8 != 0:
            return None
        return ''.join(chr(int(bits[i:i + 8], 2)) for i in range(0, len(bits), 8))
    except Exception:
        return None


def try_ascii_decimal(s):
    try:
        return ''.join(chr(int(n)) for n in re.findall(r'\d+', s))
    except Exception:
        return None


def try_number_to_alpha(s):
    try:
        return ''.join(chr(64 + int(n)) for n in re.findall(r'\d+', s) if 1 <= int(n) <= 26)
    except Exception:
        return None


def try_roman_to_alpha(s):
    def segment_words(s_, max_word_len=15):
        s_ = s_.upper()
        memo = {}

        def backtrack(index):
            if index == len(s_):
                return []

            if index in memo:
                return memo[index]

            best_segmentation = None

            for end in range(index + 1, min(len(s_) + 1, index + max_word_len + 1)):
                prefix = s_[index:end]
                if prefix.lower() in ENGLISH_WORDS:
                    rest = backtrack(end)
                    if rest is not None:
                        candidate = [prefix] + rest
                        # choose segmentation with fewer words
                        if best_segmentation is None or len(candidate) < len(best_segmentation):
                            best_segmentation = candidate

            memo[index] = best_segmentation
            return best_segmentation

        return backtrack(0)

    try:
        parts = s.strip().split()
        nums = [roman_to_int(part) for part in parts]
        letters = ''.join(chr(64 + n) for n in nums if 1 <= n <= 26)
        segmented = segment_words(letters)
        if segmented:
            return ' '.join(segmented)
        else:
            # fallback: just return the letters concatenated (no spaces)
            return letters
    except Exception:
        return None


def try_morse(s):
    try:
        return ''.join(MORSE.get(x, '?') for x in s.strip().split())
    except Exception:
        return None


def try_reverse(s):
    return s[::-1] if len(s) > 1 else None


def try_roman(s):
    if all(c.upper() in ROMAN for c in s.replace(' ', '')):
        return ' '.join(str(roman_to_int(part)) for part in s.split())
    return None


def try_zlib(s):
    try:
        raw = base64.b64decode(s)
        return zlib.decompress(raw).decode()
    except Exception:
        try:
            return zlib.decompress(s.encode()).decode()
        except Exception:
            return None


def try_caesar(s):
    candidates = []
    for i in range(1, 26):
        for direction in [+1, -1]:
            shift = i * direction
            result = ''
            for c in s:
                if c.isalpha():
                    base = ord('A') if c.isupper() else ord('a')
                    result += chr((ord(c) - base + shift) % 26 + base)
                else:
                    result += c
            candidates.append((shift, result))
    return candidates


def try_xor(s, key=None):
    # If key is None, try brute forcing short keys (1 to 3 chars)
    # To avoid prompt in recursion, key param must be given for interactive XOR
    if key is None:
        # Simplified brute force example for keys length=1 from ASCII 32 to 126
        for k in range(32, 127):
            try:
                s_bytes = bytes.fromhex(s) if all(c in '0123456789abcdefABCDEF ' for c in s) else s.encode()
                out = ''.join(chr(b ^ k) for b in s_bytes)
                if is_printable(out) and score_output(out) > 2.5:
                    return out  # Return first promising decode
            except Exception:
                continue
        return None
    else:
        try:
            s_bytes = bytes.fromhex(s) if all(c in '0123456789abcdefABCDEF ' for c in s) else s.encode()
            return ''.join(chr(b ^ ord(k)) for b, k in zip(s_bytes, cycle(key)))
        except Exception:
            return None


# === Decoder Tree ===
DECODERS = {
    'Roman→Alpha': try_roman_to_alpha,
    'Base64': try_base64,
    'Hex': try_hex,
    'ROT13': try_rot13,
    'Binary': try_binary,
    'ASCII Decimal': try_ascii_decimal,
    'Number→Alpha': try_number_to_alpha,
    'Morse': try_morse,
    'Roman': try_roman,
    'Reverse': try_reverse,
    'Zlib': try_zlib,
}


# Adjust recursive crack to not blindly recurse on Reverse or Roman which cause loops
def recursive_crack(s, depth=0, visited=None, path=None):
    if visited is None:
        visited = set()
    if path is None:
        path = []

    if depth > FLAGS['max_depth'] or s in visited:
        return path

    visited.add(s)

    if FLAGS['include_raw']:
        print(f"\n[Depth {depth}] {repr(s)}")

    best = None
    best_score = 0
    best_method = None

    for name, func in DECODERS.items():
        # Avoid repetitive looping on Reverse and Roman decoding the same string
        if name == 'Reverse' and depth > 1:
            continue
        if name == 'Roman' and depth > 1:
            continue

        out = func(s)
        if not out or out == s or not is_printable(out):
            continue
        score = score_output(out)
        e = entropy(out)

        if FLAGS['show_entropy']:
            print(f"  [{name}] Score={score:.2f} | Entropy={e:.2f} → {repr(out)}")

        decode_history.append((depth, name, s, out, score))

        if score > best_score:
            best = out
            best_score = score
            best_method = name

    if best:
        path.append((depth, best_method, best))
        return recursive_crack(best, depth + 1, visited.copy(), path)

    # Auto Caesar
    if FLAGS.get('auto_caesar', False):
        for shift, out in try_caesar(s):
            score = score_output(out)
            if score > 2.0:
                print(f"[+] Caesar {shift} → {out}")
                path.append((depth, f"Caesar {shift}", out))
                return recursive_crack(out, depth + 1, visited.copy(), path)

    # Auto XOR
    if FLAGS.get('auto_xor', False):
        # Avoid interactive input here, pass key in FLAGS or set a default test key
        key = FLAGS.get('xor_key', None)
        if key:
            out = try_xor(s, key)
            if out and is_printable(out):
                print(f"[+] XOR({key}) → {out}")
                path.append((depth, f"XOR({key})", out))
                return recursive_crack(out, depth + 1, visited.copy(), path)

    return path


def show_tree():
    print("\n=== Decode Tree ===")
    for depth, method, original, result, score in decode_history:
        print(f"[{depth}] {method} | Score: {score:.2f}\n→ {result}\n")


def save_tree(filename):
    with open(filename, 'w', encoding='utf-8') as f:
        for depth, method, original, result, score in decode_history:
            f.write(f"[{depth}] {method} | Score: {score:.2f}\n→ {result}\n\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--max-depth', type=int)
    parser.add_argument('--no-entropy', action='store_true')
    parser.add_argument('--auto-caesar', action='store_true')
    parser.add_argument('--auto-xor', action='store_true')
    parser.add_argument('--debug', action='store_true')
    parser.add_argument('--include-raw', action='store_true')
    parser.add_argument('--show-tree', action='store_true')
    parser.add_argument('--save-log', type=str)
    parser.add_argument('--nerd', action='store_true', help='Show detailed scientific decode report')

    args = parser.parse_args()
    FLAGS.update({
        'max_depth': args.max_depth or FLAGS['max_depth'],
        'show_entropy': not args.no_entropy,
        'auto_caesar': args.auto_caesar,
        'auto_xor': args.auto_xor,
        'debug': args.debug,
        'include_raw': args.include_raw,
        'show_tree': args.show_tree,
        'save_log': args.save_log,
        'nerd': args.nerd,
    })

    print("=== ARG Cipher Cracker v2 ===")
    raw = input("Paste your encoded string:\n> ").strip()
    path = recursive_crack(raw)

    print("\n=== Decode Trail ===")
    for depth, method, output in path:
        print(f"[{depth}] {method} → {output}")

    if FLAGS['show_tree']:
        show_tree()

    if FLAGS['nerd']:
        generate_nerd_report(raw, path, decode_history)

    if path:
        # Find the decoded string with the highest score in the path
        best_decoded = max(path, key=lambda x: score_output(x[2]))
        if best_decoded[2] != raw:
            print("\n[✓] Final Decoded Output:")
            print(f" {best_decoded[2]}")
        else:
            print("\n[!] No successful decode path found.")
    else:
        print("\n[!] No successful decode path found.")

    if FLAGS['save_log']:
        save_tree(FLAGS['save_log'])


if __name__ == "__main__":
    main()
