import os
import sys
import subprocess

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Locate virtual environment python.exe on Windows (check parent/workspace first)
    parent_dir = os.path.dirname(backend_dir)
    venv_python = os.path.join(parent_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
        
    if not os.path.exists(venv_python):
        # Fallback to standard python if venv python is missing
        venv_python = "python"
        
    print(f"Launching SentinelX FastAPI Backend utilizing: {venv_python}")
    
    cmd = [venv_python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nSentinelX Backend terminated by user.")

if __name__ == "__main__":
    main()
