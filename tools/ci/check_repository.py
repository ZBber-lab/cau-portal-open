"""Parse tracked configuration and scan credential patterns without printing secrets.

Scans the current tracked tree (including Markdown), not history. Heuristic detection
is not a guarantee that a repository has no secrets; no live credentials are used.
"""
import json
import re
import subprocess
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


def tracked_files():
    return subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")[:-1]


PATTERNS = {
    "GitHub credential": re.compile(r"\b(?:github_pat_[A-Za-z0-9_]{40,}|gh[pousr]_[A-Za-z0-9]{36,})\b"),
    "API key": re.compile(r"\bsk-[A-Za-z0-9_-]{32,}\b"),
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----"),
    "AWS access key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
}


def main():
    errors = []
    json_count = yaml_count = 0
    for rel in tracked_files():
        file = ROOT / rel
        raw = file.read_bytes()
        if b"\0" in raw:
            continue
        try:
            text = raw.decode("utf-8-sig")
        except UnicodeDecodeError:
            continue
        suffix = file.suffix.lower()
        try:
            if suffix == ".json":
                json.loads(text)
                json_count += 1
            elif suffix in (".yaml", ".yml"):
                list(yaml.safe_load_all(text))
                yaml_count += 1
        except (ValueError, yaml.YAMLError):
            errors.append(f"{rel}: invalid {suffix} configuration")
        for label, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{rel}:{line}: potential {label} (value redacted)")
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"Configuration parsed: {json_count} JSON / {yaml_count} YAML; credential-pattern scan passed (tracked tree only)")


if __name__ == "__main__":
    main()
