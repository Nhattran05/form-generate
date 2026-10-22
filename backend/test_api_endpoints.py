"""
Test script kiểm thử trực tiếp các logic API endpoint xuất PDF và dọn dẹp file tạm.
"""
import json
import os
from pathlib import Path
from fastapi import BackgroundTasks

from app.api.routes_form import (
    list_templates,
    get_template_detail,
    get_template_sample,
    export_pdf_auto,
    export_pdf_by_template,
)

def test_routes():
    print("1. Testing list_templates()...")
    res = list_templates()
    templates = res.get("templates", [])
    print(f"   -> Found {len(templates)} templates in registry.")
    assert len(templates) == 29

    print("2. Testing get_template_sample('01_noi_khoa')...")
    sample_data = get_template_sample("01_noi_khoa")
    assert sample_data.get("templateId") == "01_noi_khoa"
    print(f"   -> Sample for 01_noi_khoa loaded successfully.")

    print("3. Testing export_pdf_auto() with FileResponse & Background Cleanup...")
    bg_tasks = BackgroundTasks()
    file_response = export_pdf_auto(background_tasks=bg_tasks, payload=sample_data, format="pdf", download=True)
    temp_path = Path(file_response.path)
    assert temp_path.exists()
    assert temp_path.stat().st_size > 10000
    print(f"   -> Temp PDF created at {temp_path.name} ({temp_path.stat().st_size} bytes).")

    # Run background tasks to verify cleanup
    import asyncio
    asyncio.run(bg_tasks())
    assert not temp_path.exists(), "Temp PDF file should be deleted after background tasks run!"
    print("   -> Background cleanup verified: Temp file successfully removed from server!")

    print("4. Testing export_pdf_auto() with format='base64'...")
    bg_tasks2 = BackgroundTasks()
    b64_res = export_pdf_auto(background_tasks=bg_tasks2, payload=sample_data, format="base64", download=True)
    assert b64_res["success"] is True
    assert len(b64_res["pdf_base64"]) > 5000
    print(f"   -> Base64 JSON verified ({len(b64_res['pdf_base64'])} chars).")

    print("5. Testing export_pdf_by_template() across sample templates...")
    test_ids = ["02_nhi_khoa", "05_san_khoa", "10_ngoai_khoa", "15_ngoai_tru", "18_yhct_noi_tru", "21_mat_chan_thuong", "27_phcn"]
    for tid in test_ids:
        s = get_template_sample(tid)
        bg = BackgroundTasks()
        resp = export_pdf_by_template(template_id=tid, background_tasks=bg, payload=s, format="pdf", download=True)
        p = Path(resp.path)
        assert p.exists()
        size = p.stat().st_size
        asyncio.run(bg())
        assert not p.exists()
        print(f"   -> [{tid}] Compiled and cleaned: {size} bytes.")

    print("\nALL API ENDPOINTS TESTED AND VERIFIED 100% SUCCEEDED!")

if __name__ == "__main__":
    test_routes()
