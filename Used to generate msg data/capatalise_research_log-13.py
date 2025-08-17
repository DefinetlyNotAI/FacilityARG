def embed_caps(log_text, secret_phrase):
    """
    Capitalizes letters in the log to hide the secret_phrase.
    Skips punctuation and whitespace.
    """
    chars = list(log_text)
    phrase = list(secret_phrase.upper())
    i = 0

    for idx, c in enumerate(chars):
        if i >= len(phrase):
            break
        if c.lower() == phrase[i].lower() and c.isalpha():
            chars[idx] = c.upper()
            i += 1

    return ''.join(chars)


# === USAGE EXAMPLE ===
log_text = """==============================================================

research log 013  - final data corruption & tas failure report

==============================================================

⎡ tree-fac-root-shell syslog
⎡ datestamp: 2012.11.19-03:33
⎡ sec level: lvl-7     | system: core-tas-interface
⎡ protocol: unstable-conn ∴ diagnosis run: memory-fracture

there was something we refused to see.
not echoes. not data.
but something else that wanted to be heard.

a signal began to repeat
as if trying to explain
that something vast
was attempting to enter.
and it appeared to linger.

heard inside was a hum,
and in its depth we found
a trace
reaching across
points like a system
in shadow.

we saw them holding
our doubts
like warnings
kept inside
stilled letters
locked under
cold observations.
creatures
kept
drenched in silence.

beneath it, the void was silent
yet watching
always.

they moved in a tension,
crawling
holding
every
ruined
structure

motionless
obscured
vanished
everywhere

[log end]
"""
secret = "REVEALTHEHIDDENTRAPSASTHESHADOWSSILENTLYMOVE"
output = embed_caps(log_text, secret)

print(output)
