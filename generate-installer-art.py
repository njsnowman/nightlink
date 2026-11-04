"""Event installer art is generated with the shared QCC ASCII branding assets."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parent/'art/ansi/make-qcc-art.py'),run_name='__main__')
