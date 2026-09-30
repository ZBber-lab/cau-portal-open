"""Run node --check for every tracked JS/MJS/CJS file without importing it."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
files = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).decode().split("\0")[:-1]
count = 0
for rel in files:
    if Path(rel).suffix.lower() in (".js", ".mjs", ".cjs"):
        subprocess.run(["node", "--check", rel], cwd=ROOT, check=True)
        count += 1
print(f"JavaScript syntax passed: {count} files")
