import random

tree_words = [
    "oak ", "pine ", "maple ", "birch ", "cedar ", "spruce ", "willow ", "ash ",
    "elm ", "fir ", "sequoia ", "redwood ", "cypress ", "hazel ", "cherry ",
    "poplar ", "acorn ", "bark ", "branch ", "leaf ", "root ", "trunk ", "seed ",
    "sapling ", "twig ", "canopy ", "forest ", "grove ", "shade ", "photosynthesis ",
    "wood ", "lumber ", "pollen ", "evergreen ", "deciduous ", "needle ", "forestfloor ",
    "sap ", "stump ", "moss ", "lichen "
]

total_lines = 404
target_chars = 14847

# Step 1: generate words until text length >= target_chars
words = []
text_length = 0
space_count = 0

while text_length + space_count < target_chars:
    w = random.choice(tree_words)
    words.append(w)
    text_length += len(w)
    if len(words) > 1:
        space_count += 1  # space before each word except the first

# Total characters including spaces (spaces = space_count)
total_text_length = text_length + space_count

# Step 2: split words into 404 lines randomly (but line lengths must not exceed roughly target average too much)
# Let's generate random line character targets with some variation

avg_line_len = total_text_length // total_lines
# Allow variation +/- 40% of avg line length for randomness
min_len = int(avg_line_len * 0.6)
max_len = int(avg_line_len * 1.4)

lines = []
current_line = []
current_len = 0

line_targets = [random.randint(min_len, max_len) for _ in range(total_lines)]

word_index = 0
for i in range(total_lines):
    line_target = line_targets[i]
    current_line = []
    current_len = 0
    # Add words until current_len + spaces + next word fits line_target
    while word_index < len(words):
        word = words[word_index]
        word_len = len(word)
        # If current_line not empty, add 1 for space before word
        space_needed = 1 if current_line else 0
        if current_len + space_needed + word_len <= line_target or not current_line:
            # Add word to line
            if space_needed:
                current_len += 1
            current_line.append(word)
            current_len += word_len
            word_index += 1
        else:
            break
    lines.append(" ".join(current_line))

# If leftover words after all lines assigned, add to last line
if word_index < len(words):
    leftover_words = words[word_index:]
    lines[-1] += " " + " ".join(leftover_words)

# Write to file
with open("tree_chars_random_lines.txt", "w") as f:
    for line in lines:
        f.write(line + "\n")

# Report approximate stats
total_written_chars = sum(len(line) for line in lines) + len(lines) - 1  # + newlines count = len(lines)
print(
    f"Created 'tree_chars_random_lines.txt' with {len(lines)} lines and approx {total_written_chars} characters (including newlines).")
