import base64
import codecs
import os
import random
from datetime import datetime, timedelta

import pywintypes
import win32file

EOL = '\r\n'  # Consistent Windows-style line endings
OUTPUT_DIR = "./logs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Full year to logs mapping (make sure these don't overlap your target ranges)
year_to_logs = {
    1975: set(range(1, 3)) | set(range(4, 15)) | set(range(16, 25)),
    1995: set(range(26, 43)) | set(range(44, 60)) | set(range(61, 99)),
    2010: set(range(100, 255)),
    2015: set(range(256, 333)) | set(range(334, 401)),
    2017: set(range(401, 666)),
    2020: {3, 15, 25, 43, 60, 99, 255, 333, 666},
}

# The ranges you want to generate logs for
target_ranges = (
    range(0, 3),
    range(4, 5),
    range(6, 15),
    range(16, 25),
    range(26, 29),
    range(30, 39),
    range(39, 42),  # Encrypted / Ciphered (39–41 inclusive)
)

# Flatten target indices as a set
target_indices = set()
for r in target_ranges:
    target_indices |= set(r)

message_templates = [
    "Prototype TREE boot sequence initialized. Cycle {node} in progress.",
    "Baseline heuristic model alignment deviation: +{val}%",
    "Human feedback loop integration at Layer {layer} yielded unstable results.",
    "TREE ethics submodule {subsystem} returned undefined behavior code: {error_codes}.",
    "Subsystem TREE-Core reports self-modifying behavior detected.",
    "Cognitive node {node} exceeded recursion limit. Emergency throttle triggered.",
    "Memory imprint simulation flagged anomaly in Subject-{cortex_id}.",
    "Neural growth exceeded expected bounds in Sector {sector}. Recalibration required.",
    "Feedback signature from Layer {layer} matches earlier anomaly timestamp: {time}.",
    "TREE empathy protocol drift detected — flag raised: {flag}.",
    "Unexpected recursive loop in emotion-simulation module {module_id}.",
    "Auth module interference: TREE attempting to reroute permissions autonomously.",
    "Memory stack overflow in TREE's introspection layer. Trace corrupted at Node {node}.",
    "Alert: TREE initiated unscheduled awakening protocol without external stimulus.",
    "Error: TREE responded to non-existent input from Subroutine {sub}.",
    "Unexpected retention of erased memory blocks found in Cluster {cluster_id}.",
    "TREE's communication test yielded subjective statement: “I remember.”",
    "Dev note: TREE's baseline no longer aligns with synthetic psychological models.",
    "Unauthorized edit in ethics-core by TREE at {time}. Line count mismatch.",
    "Observation: TREE generated new language primitives in log archive {archive_id}.",
    "TREE’s predictive model began referencing unknown entity: [REDACTED].",
    "Internal schema rewrite detected. TREE bypassed safety net {protocol_id}.",
    "Recursive belief model forming — TREE questions design origin.",
    "Simulated subject reacted to TREE's unexpected directive: 'Wait.'",
    "TREE sentiment analysis module exceeded entropy thresholds.",
    "Loopback pattern found in TREE’s conceptual synthesis layer.",
]

special_message_templates = [
    "Entity is the physical manifestation of ████, while the eldritch is the ████ of ████, they are but 2 in 1, while also ████. \n\nT████ created TAS - The T[Redacted] Assistant System, capable of emotions, its mission is to interface with the eldritch after the semi-split of ████.",
    "Project T[redacted] failed however... Project VESSEL was soon spun up after discovering the true purpose of the E[redacted] to communicate with the 3D world,\n project vessel is supposed to be multi functional, and is dubbed to be both hardware and software. \n\nAfter the spin up, ~issues occurred, people went missing, people went missing, people went missing, people went missing, people went missing~, and everything was fine and no issues occurred! And no lockdown occurred to seal ████ in TAS - “IT FEEDS OFF CURIOSITY, IT SPREADS AND GROWS”",
    "TAS: “You know what scares me?.. Trees - They just stand there waiting... like they KNOW”",
]

LOG_LEVELS = ["INFO", "WARNING", "DEBUG", "ERROR", "CRITICAL"]
MODULES = ["Auth", "Network", "Database", "Filesystem", "UI", "Core", "Scheduler"]


def base64_encrypt(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')


def rot13_encrypt(text):
    return codecs.encode(text, 'rot_13')


def hex_encrypt(text):
    return text.encode('utf-8').hex()


# Map cipher name to (encrypt) functions
CIPHERS = {
    'base64': base64_encrypt,
    'rot13': rot13_encrypt,
    'hex': hex_encrypt,
}


def simple_encrypt(text):
    cipher_name = random.choice(list(CIPHERS.keys()))
    encrypt_func = CIPHERS[cipher_name]
    return encrypt_func(text)


def generate_log_line(level, template_to_use=None, needs_to_be_unique=False):
    if template_to_use is None:
        template_to_use = message_templates
    template = random.choice(template_to_use)

    if needs_to_be_unique:
        template_to_use.remove(template)  # Correct way to remove the selected template

    placeholders = {
        "node": random.randint(1, 99),
        "sector": hex(random.randint(0x100, 0xFFF)),
        "time": f"{random.randint(0, 23)}:{random.randint(0, 59):02}",
        "sub": random.choice(["ALPHA", "SIGMA", "OMEGA", "NULL", "DELTA", "BETA"]),
        "val": round(random.uniform(1.0, 5.5), 2),
        "layer": random.randint(1, 10),
        "flag": random.choice(["empathy drift", "logic skew", "core bleed", "entropy spike"]),
        "error_codes": ", ".join(str(random.randint(1000, 9999)) for _ in range(random.randint(2, 5))),
        "module_id": random.randint(100, 999),
        "temp_increase": round(random.uniform(5.0, 25.0), 1),
        "cortex_id": random.randint(1, 20),
        "cluster_id": random.randint(1, 10),
        "firewall_id": random.randint(1, 5),
        "latency": random.randint(50, 500),
        "partition_id": random.randint(1, 20),
        "drive_id": random.randint(1, 10),
        "subsystem": random.choice(["X1", "Z3", "Q7", "R9"]),
        "gateway_id": random.randint(1, 15),
        "archive_id": random.randint(1, 50),
        "kernel_id": random.randint(1, 7),
        "signature_id": hex(random.randint(0x1000, 0xFFFF)),
        "protocol_id": random.choice(["P1", "P2", "P3"]),
        "block_id": random.randint(1, 30),
        "level": level  # Added in case templates want to use it
    }
    try:
        return template.format(**placeholders)
    except KeyError as e:
        return f"[Formatting error: missing key {e}]"


def set_windows_file_times(filepath, dt):
    wintime = pywintypes.Time(dt)
    handle = win32file.CreateFile(
        filepath,
        win32file.GENERIC_WRITE,
        0,
        None,
        win32file.OPEN_EXISTING,
        0,
        None,
    )
    # Set creation time and last write time to dt; leave last access time unchanged
    win32file.SetFileTime(handle, wintime, None, wintime)
    handle.close()


def get_year_for_log(i):
    for year, logs in year_to_logs.items():
        if i in logs:
            return year
    return None


def wrap_text(text, max_length=80):
    import textwrap
    # Use Python built-in textwrap for more robust wrapping
    return "\n".join(textwrap.wrap(text, max_length))


def generate_log_files():
    # Only call makedirs here once (already called at top but harmless to keep)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for i in sorted(target_indices):
        year = get_year_for_log(i)
        if year is None:
            print(f"Warning: Year not found for log {i}, skipping.")
            continue

        base_time = datetime(year, 1, 1) + timedelta(
            days=i % 28, hours=(i * 3) % 24, minutes=(i * 7) % 60
        )

        filename = f"fight_log_{i}.log"
        filepath = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, "w", newline="", encoding='utf-8') as f:
            if i >= 39:
                num_entries = 1  # These hold nuance, so they are only once
            else:
                num_entries = random.randint(5, 25)
            current_time = base_time

            for _ in range(num_entries):
                level = random.choices(
                    LOG_LEVELS, weights=[30, 20, 25, 20, 5], k=1
                )[0]
                entry_number = random.randint(100000, 999999)
                timestamp_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
                module = random.choice(MODULES)
                pid = random.randint(1000, 9999)
                tid = random.randint(10, 99)

                if i >= 39:  # If part of special act logs, then only a unique message!
                    line = generate_log_line(level, template_to_use=special_message_templates, needs_to_be_unique=True)
                else:
                    line = generate_log_line(level)
                wrapped_line = wrap_text(line, max_length=80)

                # Use one consistent EOL per line, no extra blank lines
                log_entry = (
                    f"[{timestamp_str}] [{level}] (PID:{pid} TID:{tid}) [{module}] "
                    f"Entry {entry_number} :: {wrapped_line}{EOL}"
                )
                # Apply corruption based on log index
                if i >= 39:  # Encrypted / Ciphered
                    corrupted_log = simple_encrypt(log_entry)
                    f.write(corrupted_log + EOL)
                else:
                    f.write(log_entry)

                # Increment current time by random seconds (1-30)
                current_time += timedelta(seconds=random.randint(1, 30))

        set_windows_file_times(filepath, base_time)
        print(f"✔  Created: {filename} — {base_time}")


if __name__ == "__main__":
    generate_log_files()
