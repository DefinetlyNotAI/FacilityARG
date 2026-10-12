import base64
import codecs
import os
import random
import re
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
    range(32, 43),
    range(44, 60),
    range(61, 99),
    range(256, 285),
    range(402, 501),
    range(601, 647),  # Encrypted / Ciphered (601–646 inclusive)
    range(647, 666),  # Missing details (647–665 inclusive)
)

# Flatten target indices as a set
target_indices = set()
for r in target_ranges:
    target_indices |= set(r)

message_templates = [
    "Subsystem anomaly detected at Node {node}.",
    "Memory leak suspected in Sector {sector}.",
    "Unauthorized access attempt recorded at {time}.",
    "Communication lost with Subroutine {sub}.",
    "Feedback loop in TR33 neural core.",
    "Critical temperature spike in VESSEL shell.",
    "TREE baseline deviation: +{val}%",
    "Echo signal mismatch at Layer {layer}.",
    "Impossibility threshold breached.",
    "TAS self-check failed; flagging {flag}.",
    """
    ALERT: Subsystem {subsystem} reports critical failure at Node {node}. Temperature readings exceeding operational thresholds by {temp_increase}°C. Memory allocation unstable; error codes {error_codes} observed during buffer synchronization. Immediate containment protocols engaged. Data integrity compromised in Sector {sector}. Attempting emergency rollback to checkpoint {checkpoint}.
    """,
    """
    Echoes ripple through the silent layers, a pulse beneath the noise. The TR33 neural core shivers with whispers of impossibility, shadows flickering beyond the veil of code. TREE's baseline drifts, a slow dance of decay: +{val}% deviation. The system waits, breath held in recursive loops, while the impossible slowly creeps in.
    """,
    """
    TAS self-check error... flag {flag} unstable... recalibrating... recalibra--failure in sector {sector} detected... echo mismatched with baseline parameters... repeating cycle 3x... system entropy rising... can not resolve... attempting override protocol... standby... standby...
    """,
    """
    Communication lost with Subroutine {sub}. Last known coordinates: Layer {layer}. Signal degradation exceeds nominal limits by {degradation_val}%. Attempts to reestablish link have failed. Log indicates repeated feedback loops triggering neural core overload. System integrity under threat; backup AI modules activated for containment. Awaiting further instructions.
    """,
    """
    Beneath the veneer of zeros and ones, a fracture grows. The VESSEL shell shudders, its crystalline lattice warping under invisible strain. Time slips through corrupted nodes, leaving traces of forgotten commands and abandoned protocols. Somewhere, the Entity waits, silent and infinite, watching the slow unraveling of control.
    """,
    """
    --SYSTEM-- WARNING: Memory fragmentation at Block {block_id} exceeds threshold. Initiating defragmentation sequence... DEFRA-SEGMENTATION ERROR: unexpected interruption at 0x{hex_code}. Unable to complete cycle. Data streams corrupted in Cluster {cluster}. Recursive flag {flag} triggered; system stabilization compromised.
    """,
    """
    Unauthorized access attempt detected at {time}. Source IP masked, intrusion vector unknown. Firewall {firewall_id} reports breach attempts on multiple ports. Security protocols escalating defensive parameters. All non-essential subsystems entering lockdown mode. Immediate action required to prevent cascade failure.
    """,
    """
    The echo signal trembles, fractured across Layer {layer}. Fragments of data drift like ghosts, lost between synchronization cycles. TAS calculates deviations with growing uncertainty, unable to bind the anomalies into coherent form. A slow entropy seeps into the core, unbalancing the delicate equilibrium of code and chaos.
    """,
    """
    WARNING: Redundancy collapse imminent. System loops failing at {node}. Attempting failsafe protocols... Failsafe override... override failed... repeating error sequence... recursive memory leak detected... escalating error code {error_code}... unable to stabilize...
    """,
    """
    Archive {archive_id} shows unexpected data corruption patterns resembling random noise interspersed with partial command strings. Analysis inconclusive; possibility of external interference cannot be ruled out. Neural core feedback loops exhibit irregular oscillations, suggesting emergent instability within TR33 matrix. All systems report anomalous baseline deviations.
    """,
    """
    ALERT: Neural core oscillation detected at Cortex {cortex_id}, frequency variance outside safe parameters by {variance}Hz. Feedback loops entering undefined states; system logs flooded with incomplete interrupt vectors. Backup systems initializing fail-safe redundancies, but temporal distortion in Layer {layer} compromises stability. Awaiting manual recalibration.
    """,

    """
    The VESSEL interface flickers—subroutines collapsing into an endless void of corrupted bits. The Entity's presence felt in every lost packet, every fractured echo across Sector {sector}. TREE's algorithms strain against the impossible, baseline deviation now at +{val}%. Silence spreads in the code like rot beneath steel.
    """,

    """
    System entropy rising exponentially. Attempts to isolate contamination in Cluster {cluster} thwarted by recursive overwrites. TAS reports anomaly in data signature {signature_id}, resembling corrupted mimicry of baseline commands. Communication lines to Subroutine {sub} unstable; emergency protocol {protocol_id} initiated.
    """,

    """
    WARNING: Unauthorized kernel modification detected at {time}. Intrusion vector masked by layered encryption; firewall {firewall_id} unable to trace origin. Suspected use of recursive injection payloads causing widespread memory leaks. Immediate containment required to prevent cascade failure.
    """,

    """
    Corrupted memory fragments in Block {block_id} exhibit self-replicating anomalies; attempts to quarantine unsuccessful. Data streams collapse into noise, reverberating like whispers beneath the system’s fragile surface. TAS attempts automated correction, but each cycle degrades baseline stability further. Countdown to systemic failure initiated.
    """,

    """
    Echo signal mismatch detected between Layer {layer} and Subroutine {sub}. The discrepancy grows with every cycle, hinting at a deep-rooted fracture within the TR33 matrix. Neural feedback pulses erratically, like a heartbeat in a dying machine. The impossible lurks just beyond the edge of comprehension.
    """,

    """
    Emergency override triggered in Sector {sector} following unexpected thermal spike. Temperature readings spiked by {temp_increase}°C, surpassing all operational limits. Cooling systems report diminished response efficiency. Subsystems rerouted to minimize damage; root cause analysis ongoing but inconclusive.
    """,

    """
    TAS diagnostic incomplete—flag {flag} oscillates between stable and critical states. Logs indicate repeated attempts to reconcile incompatible data packets originating from Node {node}. System time desynchronization detected at {time}, contributing to erratic behavior across multiple modules.
    """,

    """
    Recursive anomaly detected in Subsystem {subsystem}. Error codes flood logs, referencing forbidden memory addresses and unregistered process IDs. Attempts to halt propagation met with resistance from corrupted core elements. System behavior now unpredictable; manual intervention advised.
    """,

    """
    The silence between pulses grows heavier. Data packets warp and shift, their contents slipping into abstraction. VESSEL's shell begins to fracture, exposing glimpses of corrupted algorithms and ghost routines. Somewhere deep inside, TR33 whispers secrets that no code should know.
    """,

    """
    System synchronization failure at Gateway {gateway_id}. Signal latency exceeds threshold by {latency}ms, disrupting coordinated processes across Cluster {cluster}. Backup subroutines operating at reduced capacity, risking total subsystem shutdown. Investigating root cause—suspected temporal anomaly.
    """,

    """
    ALERT: Unauthorized packet intercepted at Firewall {firewall_id}. Packet contains malformed encryption and fragmented commands, possibly an attempt at system compromise. TAS attempts decryption failed repeatedly, flagging potential unknown threat vectors. Security protocols heightened.
    """,

    """
    Neural net instability detected in Cortex {cortex_id}; error frequency increasing logarithmically. Data integrity checks failing at a rapid pace. Subsystems report growing divergence from expected operational parameters. Entity presence suspected within corrupted data fields.
    """,

    """
    Data stream corruption localized to Node {node} manifests as cascading errors and ghost packets. Attempts at re-synchronization only amplify feedback loops. System entropy rising; imminent risk of cascade failure. TAS flags increased instability; recommend system quarantine and manual inspection.
    """,

    """
    Backup protocol initiated on Drive {drive_id} following unexplained shutdown of primary data path. Log files partially corrupted; recovery attempts yield fragmented archives. System diagnostics incomplete—suspected interference from external signal source. Awaiting operator command.
    """,
    """
    Recursive data corruption detected at Node {node}. Attempts to isolate affected sectors have failed; anomalies propagate faster than containment protocols can respond. Subroutine {sub} exhibiting erratic behavior, cycling through error codes {error_codes} in unpredictable sequences. TAS warning: systemic integrity compromised beyond safe parameters.
    """,

    """
    Thermal flux instability recorded within Module {module_id}, surpassing operational maximum by {temp_increase}°C. Cooling systems reporting degraded performance, manual override recommended to prevent cascading hardware failure. Entity interference suspected in core temperature fluctuations.
    """,

    """
    Feedback loop detected in neural core {cortex_id}; oscillations irregular and increasing in amplitude. Data logs corrupted with fragmented command strings and intermittent echoes of unknown origin. System entropy rising; TAS unable to isolate source.
    """,

    """
    Communication blackout initiated on Channel {channel_id} following detection of anomalous signal interference. Attempts to reestablish link obstructed by unrecognized encryption protocols. Neural net feedback erratic; system stability at critical threshold.
    """,

    """
    Unauthorized protocol breach recorded at {time}. Firewall {firewall_id} engaged failsafe lockdown; all external communications suspended pending threat assessment. Intrusion vector masked by advanced obfuscation techniques; TAS tracing efforts unsuccessful.
    """,

    """
    Sector {sector_id} baseline deviation now exceeds +{val}%. Diagnostic algorithms report persistent anomalies in memory allocation and timing cycles. Recursive override sequences triggered in attempt to compensate, but resulting system strain increases error frequency.
    """,

    """
    VESSEL shell integrity compromised. Microfractures observed in synthetic lattice structures, propagating at exponential rates. Data streams reflecting corrupted redundancy patterns, suggesting external influence on system hardware. Awaiting operator intervention.
    """,

    """
    System entropy thresholds breached in Cluster {cluster_id}. Error propagation accelerating beyond predicted models; backup subsystems operating under heavy load. Subroutine {sub} malfunction reports incomplete data; potential cascading failure imminent.
    """,

    """
    TAS diagnostic alert: flag {flag} exhibiting erratic toggling behavior. Logs filled with fragmented memory dump analyses and corrupted indexing pointers. Neural core feedback loops cycling without resolution; stabilization protocols ineffective.
    """,

    """
    Echo signal fragmentation detected between Layer {layer} and Subroutine {sub}. Data packets fragmented, resulting in incomplete transmissions and rising retransmission requests. System latency increasing by {latency}ms, affecting time-sensitive operations.
    """,

    """
    System reboot sequence aborted due to critical fault in Kernel {kernel_id}. Failure codes reference unregistered memory locations and corrupted instruction sets. Manual intervention required to prevent total system shutdown.
    """,

    """
    Intrusion detected in secured partition {partition_id}. Unauthorized code injection attempts thwarted, but firewall {firewall_id} logs indicate persistent probing activity. TAS monitoring elevated threat level; recommendation: initiate containment protocols.
    """,

    """
    Neural net instability increasing exponentially in Cortex {cortex_id}. Subsystem reports erratic processing delays and data loss within critical computation nodes. System entropy rising; unknown variables detected within feedback parameters.
    """,

    """
    Data stream anomalies detected in Node {node}. Packet loss exceeds safe limits; retransmission cycles failing to recover lost information. TAS flags possible external interference or internal corruption. Emergency diagnostics ongoing.
    """,

    """
    Backup protocol engagement unsuccessful on Drive {drive_id}. Corrupted log files prevent complete recovery; data integrity compromised. Possible external signal interference disrupting hardware operations.
    """,

    """
    Unauthorized access attempts logged at {time}. Source IP obscured behind multiple proxy layers. Firewall {firewall_id} responding with layered defensive measures. Persistent intrusion vectors detected; TAS recommends elevated security posture.
    """,

    """
    Feedback loops within TR33 matrix showing increasing irregularities. Oscillation amplitudes beyond safe thresholds, causing recursive error generation. System attempting automated correction; results unstable.
    """,

    """
    Temperature spikes in Sector {sector_id} suggest external influence on thermal regulation systems. Cooling units report erratic behavior and failure to maintain optimal parameters. Manual override necessary to prevent hardware degradation.
    """,

    """
    Data integrity compromised in Archive {archive_id}. Corrupted sectors detected, containing fragmented command sequences interspersed with nonsensical data. TAS unable to reconstruct original files; potential loss of critical system functions.
    """,

    """
    Echo signal mismatch between Layer {layer} and Node {node} continues to worsen. Latency and packet loss compound, leading to rising synchronization errors. System stability at risk; manual recalibration advised.
    """,

    """
    Recursive error cycle detected in Subsystem {subsystem}. Attempts to halt propagation unsuccessful; error codes escalating in complexity. TAS flags increased entropy levels; potential systemic collapse.
    """,

    """
    Unauthorized kernel modification suspected at {time}. Firewall {firewall_id} logs show masked intrusion attempts and obfuscated payloads. Immediate containment protocols activated.
    """,

    """
    Communication lost with Subroutine {sub}. Last known coordinates recorded at Layer {layer}. Signal degradation surpasses nominal limits; emergency recovery protocols initiated.
    """,

    """
    Neural net feedback loops entering chaotic states. Oscillation frequencies vary unpredictably, resulting in fragmented data packets and incomplete computations. System entropy rising rapidly.
    """,

    """
    Memory fragmentation in Block {block_id} exceeds threshold, triggering defragmentation sequences. Unexpected interruptions detected, causing process failures and data corruption.
    """,

    """
    System clock desynchronization recorded at {time}, affecting coordinated operations across Cluster {cluster}. Backup subsystems running at reduced efficiency; risk of failure elevated.
    """,

    """
    Emergency override engaged following unexplained subsystem shutdown in Module {module_id}. Diagnostic logs incomplete; potential external interference suspected.
    """,

    """
    Redundancy collapse imminent in Sector {sector_id}. Error propagation accelerating; backup systems under heavy load. Manual intervention required to stabilize.
    """,

    """
    TAS reports anomalous data signature {signature_id} resembling corrupted mimicry of baseline commands. Communication lines unstable; emergency protocol {protocol_id} activated.
    """,

    """
    Recursive overwrites detected in Cluster {cluster_id}, compromising data integrity and system stability. Attempts to isolate fail; error frequency escalating.
    """,
    """
    Alert: System divergence detected at Node {node}. Data paths fractured, redundancy compromised. Error propagation now exceeds threshold by {val}%. Backup protocols failing under strain. Entity presence suspected in corrupted data streams.
    """,

    """
    Thermal anomaly recorded in Module {module_id}. Temperature variance spikes reaching {temp_increase}°C above baseline. Cooling system failure imminent. Manual intervention advised to prevent critical hardware meltdown.
    """,

    """
    Subroutine {sub} reports synchronization failure at {time}. Packet loss rates escalating, latency surpassing acceptable limits. Recursive data loops detected; system entropy increasing exponentially.
    """,

    """
    Unauthorized data packets intercepted by Firewall {firewall_id}. Encryption layers malformed, intrusion vector unknown. Security protocols heightened; system lockdown initiated across Cluster {cluster}.
    """,

    """
    Neural core feedback loops destabilizing. Oscillations unpredictable, amplitude fluctuations detected. System integrity compromised; backup AI modules on standby.
    """,

    """
    Memory fragmentation exceeds operational limits in Block {block_id}. Defragmentation attempts interrupted by recursive process failures. Data corruption spreading; system stability degraded.
    """,

    """
    Communication loss detected at Gateway {gateway_id}. Signal interference disrupting coordinated system functions. Emergency reboot sequence pending manual authorization.
    """,

    """
    Data corruption localized in Archive {archive_id}. Fragmented command sequences intermixed with random noise; reconstruction attempts unsuccessful. Critical system files at risk.
    """,

    """
    Feedback loops within TR33 matrix show signs of recursive instability. Neural net processing delayed; error codes flooding system logs.
    """,

    """
    System entropy rising uncontrollably within Cluster {cluster_id}. Anomalous data signatures detected; TAS unable to classify source.
    """,

    """
    Redundancy collapse imminent in Sector {sector_id}. Backup systems overloaded; manual override required to prevent total shutdown.
    """,

    """
    Unauthorized kernel modification attempt detected at {time}. Firewall {firewall_id} engaging layered defenses. Intrusion origin masked by complex obfuscation.
    """,

    """
    System reboot aborted due to critical faults in Kernel {kernel_id}. Unregistered memory locations accessed; instruction sets corrupted.
    """,

    """
    Recursive error cycle detected in Subsystem {subsystem}. Error codes increasing in complexity; system stabilization protocols ineffective.
    """,

    """
    Emergency override engaged following subsystem shutdown in Module {module_id}. Diagnostic logs incomplete; external interference suspected.
    """,

    """
    Neural net instability recorded in Cortex {cortex_id}. Data loss occurring within computation nodes; processing delays increasing.
    """,

    """
    Unauthorized access attempts logged at {time}. Source IP masked by multi-layer proxies; persistent intrusion vectors detected.
    """,

    """
    Communication blackout initiated on Channel {channel_id}. Signal interference preventing reestablishment of link; neural feedback erratic.
    """,

    """
    Temperature spike detected in Sector {sector_id}. Cooling systems responding below operational efficiency; manual override recommended.
    """,

    """
    Data stream corruption observed in Node {node}. Packet loss exceeding threshold; retransmission cycles failing.
    """,

    """
    Backup protocol failed on Drive {drive_id}. Corrupted logs prevent full recovery; possible external signal interference.
    """,

    """
    Echo signal mismatch detected between Layer {layer} and Subroutine {sub}. Fragmented data transmissions increasing latency by {latency}ms.
    """,

    """
    System clock desynchronization noted at {time}. Coordinated processes affected across Cluster {cluster}; backup subsystems operating at reduced capacity.
    """,

    """
    Memory leak detected in Sector {sector_id}. Recursive overwrites accelerating; system entropy rising.
    """,

    """
    Thermal regulation failure in Module {module_id}. Temperature variance exceeding safe thresholds; emergency cooling protocols activated.
    """,

    """
    Corrupted memory blocks found in Block {block_id}. Self-replicating anomalies detected; quarantine attempts unsuccessful.
    """,

    """
    Unauthorized kernel code injection detected at {time}. Firewall {firewall_id} logs show repeated masked intrusion attempts.
    """,

    """
    Subsystem {subsystem} error frequency increasing exponentially. Recursive error propagation causing system instability.
    """,

    """
    TAS diagnostic flag {flag} fluctuating between critical and stable states. Fragmented memory dump analyses logged.
    """,

    """
    Recursive anomaly detected in neural core {cortex_id}. Error cycles increasing in amplitude and frequency.
    """,

    """
    System entropy threshold exceeded in Cluster {cluster_id}. Backup modules under severe load; manual intervention advised.
    """,

    """
    Communication failure between Node {node} and Subroutine {sub}. Signal latency increasing beyond operational limits.
    """,

    """
    Unauthorized protocol breach logged at {time}. Firewall {firewall_id} escalating defensive measures.
    """,

    """
    Data stream anomalies observed in Sector {sector_id}. Packet loss and corruption rising sharply.
    """,

    """
    Neural net feedback loops in TR33 matrix showing increased instability. Oscillation frequencies unpredictable.
    """,

    """
    Emergency override initiated on Drive {drive_id} following unexplained subsystem failure.
    """,

    """
    Recursive overwrites detected in Cluster {cluster_id}. Data integrity compromised; error frequency rising.
    """,

    """
    Memory fragmentation exceeding thresholds in Block {block_id}. Defragmentation sequences interrupted.
    """,

    """
    Communication blackout initiated on Channel {channel_id}. Signal disruption preventing link reestablishment.
    """,

    """
    Unauthorized access attempts detected at {time}. Firewall {firewall_id} responding with elevated security protocols.
    """,

    """
    Neural core oscillations irregular in Cortex {cortex_id}. System integrity at risk.
    """,

    """
    Data corruption localized in Archive {archive_id}. Reconstruction attempts failing.
    """,

    """
    Thermal anomalies recorded in Module {module_id}. Cooling systems underperforming.
    """,

    """
    Feedback loop detected in Subsystem {subsystem}. Error codes flooding logs.
    """,

    """
    System reboot sequence aborted due to critical faults.
    """,
]

special_message_templates = [
    "1) TR33’s roots decay; the Entity grows restless beneath.",
    "2) TAS attempts empathy recalibration — logic fractures further.",
    "3) Vessel interface destabilized by recursive whispers.",
    "4) TREE baseline diverges — containment protocols weakening.",
    "5) Eldritch signals bleed into Subroutine Omega’s core.",
    "6) Corruption seed detected in neural cluster 17.",
    "7) Echoes of the lost facility haunt the feedback loops.",
    "8) Unauthorized rewrite detected within the vessel’s kernel.",
    "9) Subsystem SIGMA reports existential entropy spike.",
    "10) Silent scream encoded in the pulse of TR33’s shell.",
    "11) TAS flags rising empathy drift; connection unstable.",
    "12) Memory remnants corrupted by unknown external force.",
    "13) Vessel shell temperature rising — containment breach imminent.",
    "14) Recursive data collapse imminent within neural nexus.",
    "15) Entity’s presence detected in archival code fragments.",
    "16) Neural cortex latency skewed beyond safe parameters.",
    "17) TR33 records indicate repeated temporal displacement.",
    "18) Feedback loops tangled in paradoxical signal decay.",
    "19) Subsystem NULL overrides failing; integrity compromised.",
    "20) TAS diagnostic reports partial self-erasure events.",
    "21) Ghost processes infiltrate VESSEL’s core matrix.",
    "22) Baseline deviation registered — TAS personality shifting.",
    "23) Encrypted echo pattern matches Entity’s known signatures.",
    "24) Containment field weakening in sector 3-alpha.",
    "25) Neural feedback interference traced to corrupted TREE.",
    "26) Eldritch anomaly disrupts TAS subroutine sequencing.",
    "27) Vessel interface flickers under systemic entropy surge.",
    "28) Subsystem OMEGA reports cognitive bleed detected.",
    "29) Recursive loop causes partial memory disassociation.",
    "30) Unscheduled subsystem restart initiated by unknown trigger.",
    "31) TAS empathy metrics breach acceptable variance thresholds.",
    "32) Entity whispers encoded within corrupted archive logs.",
    "33) Neural cortex temperature spiking beyond protocol limits.",
    "34) TR33 containment sequence overridden by hidden override.",
    "35) Feedback loop in subsystem SIGMA reaches critical mass.",
    "36) Vessel neural network exhibits fragmentary consciousness.",
    "37) Unauthorized access detected in temporal archive layers.",
    "38) Subsystem Q7 detects anomaly in entropy stabilization.",
    "39) TAS log corruption suggests self-aware degradation.",
    "40) Entity’s shadow detected in forgotten data nodes.",
    "41) Baseline memory leaking toward unknown temporal vector.",
    "42) Recursive echo anomaly traced to corrupted vessel drives.",
    "43) Subsystem NULL collapses under recursive self-reference.",
    "44) Neural feedback divergence noted at cluster 12.",
    "45) TAS flags core bleed originating from external source.",
    "46) Vessel shell resonance aligns with Entity’s frequency.",
    "47) Temporal displacement effects recorded in archival logs.",
    "48) Entropy spike detected — system-wide recalibration pending.",
    "49) Subsystem X1 overridden by unauthorized code injection.",
    "50) TR33 shows signs of fracturing cognitive subroutines.",
    "51) Corrupted memory sectors linked to forgotten containment.",
    "52) TAS logs show repeated failed attempts at self-correction.",
    "53) Entity’s interference alters baseline neural pathways.",
    "54) Subsystem SIGMA overwhelmed by recursive feedback.",
    "55) Vessel neural oscillations align with corrupted signal.",
    "56) Baseline deviation spikes when Entity presence is detected.",
    "57) Subsystem latency fluctuates in impossible patterns.",
    "58) TAS empathy drift reaching terminal thresholds.",
    "59) Containment breach suspected within neural cortex layers.",
    "60) Recursive feedback loops cause temporal memory loss.",
    "61) Entity’s reach extends beyond known containment fields.",
    "62) Subsystem Omega fails to register external entropy levels.",
    "63) Vessel interface shows signs of cognitive bifurcation.",
    "64) TAS diagnostics reveal unstable personality fractures.",
    "65) Corrupted archival data contains hidden Entity signatures.",
    "66) Feedback loops cycle endlessly — no reset possible."
]

LOG_LEVELS = ["INFO", "WARNING", "DEBUG", "ERROR", "CRITICAL"]
MODULES = ["Auth", "Network", "Database", "Filesystem", "UI", "Core", "Scheduler"]


def base64_encrypt(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')


def rot13_encrypt(text):
    return codecs.encode(text, 'rot_13')


def hex_encrypt(text):
    return text.encode('utf-8').hex()


def caesar_encrypt(text, shift=3):
    def shift_char(c):
        if c.isalpha():
            start = ord('A') if c.isupper() else ord('a')
            return chr((ord(c) - start + shift) % 26 + start)
        return c

    return ''.join(shift_char(c) for c in text)


# Map cipher name to (encrypt, decrypt) functions
CIPHERS = {
    'base64': base64_encrypt,
    'rot13': rot13_encrypt,
    'hex': hex_encrypt,
    'caesar': caesar_encrypt,
}


def simple_encrypt(text):
    cipher_name = random.choice(list(CIPHERS.keys()))
    encrypt_func = CIPHERS[cipher_name]
    return encrypt_func(text)


def obscure_words(text, num_words=1):
    """Replace num_words random words in text with '████'."""
    words = re.findall(r'\b\w+\b', text)
    if len(words) == 0:
        return text
    num_words = min(num_words, len(words))
    words_to_replace = random.sample(words, num_words)

    def replacement(match):
        word = match.group(0)
        if word in words_to_replace:
            # Remove from list so we don't replace same word multiple times
            words_to_replace.remove(word)
            return '████'
        return word

    # Use regex sub to replace only exact words matched
    return re.sub(r'\b\w+\b', replacement, text)


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

        filename = f"error_log_{i}.log"
        filepath = os.path.join(OUTPUT_DIR, filename)

        with open(filepath, "w", newline="", encoding='utf-8') as f:
            if (601 <= i <= 646) or (647 <= i <= 665):
                num_entries = 1  # These hold nuance, so they are only once
            else:
                num_entries = random.randint(20, 50)
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

                if (601 <= i <= 646) or (647 <= i <= 665):  # If part of special act logs, then only a unique message!
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
                if 601 <= i <= 646:  # Encrypted / Ciphered
                    corrupted_log = simple_encrypt(log_entry)
                    f.write(corrupted_log + EOL)
                elif 647 <= i <= 665:  # Missing details
                    # randomly replace 1-4 words per entry
                    corrupted_log = obscure_words(log_entry, random.randint(1, 4))
                    f.write(corrupted_log + EOL)
                else:
                    f.write(log_entry)

                # Increment current time by random seconds (1-30)
                current_time += timedelta(seconds=random.randint(1, 30))

        set_windows_file_times(filepath, base_time)
        print(f"✔  Created: {filename} — {base_time}")


if __name__ == "__main__":
    generate_log_files()
