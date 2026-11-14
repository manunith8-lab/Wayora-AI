"""
build_all.py
Orchestrates the entire database pipeline:
1. expand_all_states.py: Expands and enriches all relational CSV tables.
2. build_dataset.py: Compiles all CSV tables into india_tourism.json.
3. audit_dataset.py: Performs relational validation and writes audit_report.json.
"""
import subprocess
import sys
import os

D = os.path.dirname(os.path.abspath(__file__))

def main():
    print("=" * 60)
    print("Executing Master Database Build Pipeline (build_all.py)")
    print("=" * 60)

    pipeline = ["expand_all_states.py", "build_dataset.py", "audit_dataset.py"]
    for s in pipeline:
        script_path = os.path.join(D, s)
        print(f"\n>>> Running {s}...")
        subprocess.run([sys.executable, script_path], cwd=D, check=True)

    print("\n" + "=" * 60)
    print("Master Database Build Pipeline completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
