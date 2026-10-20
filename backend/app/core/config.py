from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent
SHARED_SCHEMAS_DIR = PROJECT_ROOT / "shared-schemas"
REGISTRY_PATH = SHARED_SCHEMAS_DIR / "registry.json"
TEMPLATES_DIR = SHARED_SCHEMAS_DIR / "templates"
SAMPLES_DIR = SHARED_SCHEMAS_DIR / "samples"
OUTPUT_DIR = BASE_DIR / "generated_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
