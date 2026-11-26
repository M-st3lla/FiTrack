import os
import subprocess
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
result = subprocess.run(
    [sys.executable, "-m", "pytest", "-q"], cwd=backend_dir, env=os.environ.copy()
)
print("TESTS_EXIT_CODE", result.returncode, flush=True)

from app import create_app

create_app().run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
