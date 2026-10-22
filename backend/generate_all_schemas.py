"""
Script tự động sinh và chuẩn hóa toàn bộ 29 file Template Schemas & 29 file Sample JSONs
cho 29 mẫu bệnh án trong Phụ lục XXVIII (Thông tư 32/2023/TT-BYT).
"""
import copy
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
SHARED_DIR = ROOT_DIR / "shared-schemas"
TEMPLATES_DIR = SHARED_DIR / "templates"
SAMPLES_DIR = SHARED_DIR / "samples"
REGISTRY_PATH = SHARED_DIR / "registry.json"

TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

# 1. Đọc base schemas & base samples đã có
base_01_schema = json.loads((TEMPLATES_DIR / "01_noi_khoa.json").read_text(encoding="utf-8"))
base_02_schema = json.loads((TEMPLATES_DIR / "02_nhi_khoa.json").read_text(encoding="utf-8"))
base_10_schema = json.loads((TEMPLATES_DIR / "10_ngoai_khoa.json").read_text(encoding="utf-8"))
base_15_schema = json.loads((TEMPLATES_DIR / "15_ngoai_tru.json").read_text(encoding="utf-8"))
base_18_schema = json.loads((TEMPLATES_DIR / "18_yhct_noi_tru.json").read_text(encoding="utf-8"))

base_01_sample = json.loads((SAMPLES_DIR / "01_noi_khoa.sample.json").read_text(encoding="utf-8"))
base_02_sample = json.loads((SAMPLES_DIR / "02_nhi_khoa.sample.json").read_text(encoding="utf-8"))
base_10_sample = json.loads((SAMPLES_DIR / "10_ngoai_khoa.sample.json").read_text(encoding="utf-8"))
base_15_sample = json.loads((SAMPLES_DIR / "15_ngoai_tru.sample.json").read_text(encoding="utf-8"))
base_18_sample = json.loads((SAMPLES_DIR / "18_yhct_noi_tru.sample.json").read_text(encoding="utf-8"))

registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))

# Ánh xạ nhóm template cho từng ID
for item in registry.get("templates", []):
    tid = item["id"]
    group = item.get("layoutGroup", "internal_standard")

    # Chọn base phù hợp
    if group == "pediatric_standard":
        schema_data = copy.deepcopy(base_02_schema)
        sample_data = copy.deepcopy(base_02_sample)
    elif group == "surgical_standard":
        schema_data = copy.deepcopy(base_10_schema)
        sample_data = copy.deepcopy(base_10_sample)
    elif group == "outpatient_standard":
        schema_data = copy.deepcopy(base_15_schema)
        sample_data = copy.deepcopy(base_15_sample)
    elif group == "traditional_medicine":
        schema_data = copy.deepcopy(base_18_schema)
        sample_data = copy.deepcopy(base_18_sample)
    else:
        schema_data = copy.deepcopy(base_01_schema)
        sample_data = copy.deepcopy(base_01_sample)

    # Cập nhật metadata đúng theo mẫu
    schema_data["id"] = tid
    schema_data["code"] = item["code"]
    schema_data["officialCode"] = item["officialCode"]
    schema_data["title"] = item["title"]
    schema_data["layoutGroup"] = group

    sample_data["templateId"] = tid
    if "header" in sample_data:
        sample_data["header"]["tenBenhAn"] = item["title"]
        sample_data["header"]["maSo"] = item["officialCode"]

    # File paths
    target_schema_filename = f"{tid}.json"
    target_sample_filename = f"{tid}.sample.json"

    schema_file_path = TEMPLATES_DIR / target_schema_filename
    sample_file_path = SAMPLES_DIR / target_sample_filename

    # Chỉ ghi nếu chưa có hoặc cập nhật
    schema_file_path.write_text(json.dumps(schema_data, ensure_ascii=False, indent=2), encoding="utf-8")
    if not sample_file_path.exists() or sample_data.get("templateId") != tid:
        sample_file_path.write_text(json.dumps(sample_data, ensure_ascii=False, indent=2), encoding="utf-8")

    # Cập nhật registry trỏ đúng file riêng biệt
    item["schemaFile"] = f"templates/{target_schema_filename}"
    item["sampleFile"] = f"samples/{target_sample_filename}"

# Lưu lại registry.json
REGISTRY_PATH.write_text(json.dumps(registry, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Successfully generated {len(registry['templates'])} schemas and samples.")
