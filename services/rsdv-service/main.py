import re
import hashlib
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="ClinCommand OS™ - Remote SDV (rSDV) Engine",
    description="FastAPI service for OCR pipeline (Textract/Tesseract) and medical PII redaction",
    version="15.1"
)

# Simulated in-memory storage for local deployment
documents_db = []
verification_tasks_db = []

class ReviewRequest(BaseModel):
    document_id: int
    review_notes: str
    review_status: str # PENDING, VERIFIED, DISCREPANCY_FOUND

@app.get("/health")
def read_health():
    return {"status": "HEALTHY", "service": "rsdv-service"}

@app.post("/api/v1/rsdv/upload")
async def upload_document(
    subject_id: int = Form(...),
    document_name: str = Form(...),
    document_url: str = Form(...),
    ocr_provider: str = Form("tesseract") # tesseract or aws
):
    # Calculate unique hash for document to verify GxP integrity
    doc_content = f"{subject_id}:{document_name}:{document_url}".encode('utf-8')
    doc_hash = hashlib.sha256(doc_content).hexdigest()

    # Simulate OCR Process
    raw_ocr_text = f"Patient Name: John Doe, DOB: 1980-05-12, Address: 123 Health Ave, Phone: 555-0199. Vital Signs: Heart Rate 72 bpm. MRN: MRN9876543."
    
    # Simulate PII/PHI Redaction using Regex (mimics spaCy medical NER)
    redacted_text = raw_ocr_text
    redacted_text = re.sub(r'John Doe', '[REDACTED NAME]', redacted_text)
    redacted_text = re.sub(r'1980-05-12', '[REDACTED DOB]', redacted_text)
    redacted_text = re.sub(r'123 Health Ave', '[REDACTED ADDRESS]', redacted_text)
    redacted_text = re.sub(r'555-0199', '[REDACTED PHONE]', redacted_text)
    redacted_text = re.sub(r'MRN9876543', '[REDACTED MRN]', redacted_text)

    # Generate document record
    doc_id = len(documents_db) + 1
    doc_record = {
        "id": doc_id,
        "subject_id": subject_id,
        "document_name": document_name,
        "document_url": document_url,
        "document_hash": doc_hash,
        "redacted_url": f"/storage/redacted/doc_{doc_id}.pdf",
        "ingest_status": "REDACTED",
        "raw_text": raw_ocr_text,
        "redacted_text": redacted_text
    }
    documents_db.append(doc_record)

    # Automatically generate Verification Tasks based on OCR data
    tasks = [
        {"id": len(verification_tasks_db) + 1, "document_id": doc_id, "field_key": "patient_name", "ecrf_value": "John Doe", "source_value": "John Doe", "is_verified": False},
        {"id": len(verification_tasks_db) + 2, "document_id": doc_id, "field_key": "date_of_birth", "ecrf_value": "1980-05-12", "source_value": "1980-05-12", "is_verified": False},
        {"id": len(verification_tasks_db) + 3, "document_id": doc_id, "field_key": "heart_rate", "ecrf_value": "72", "source_value": "72", "is_verified": False}
    ]
    for task in tasks:
        verification_tasks_db.append(task)

    return {
        "success": True,
        "document": doc_record,
        "tasks": tasks
    }

@app.post("/api/v1/rsdv/review")
def review_document(req: ReviewRequest):
    # Find document
    doc = next((d for d in documents_db if d["id"] == req.document_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc["ingest_status"] = "VERIFIED" if req.review_status == "VERIFIED" else "OCR_COMPLETED"
    
    # Mark associated verification tasks as verified
    for task in verification_tasks_db:
        if task["document_id"] == req.document_id:
            task["is_verified"] = (req.review_status == "VERIFIED")

    return {
        "success": True,
        "document_id": req.document_id,
        "review_status": req.review_status,
        "notes": req.review_notes
    }

@app.get("/api/v1/rsdv/tasks")
def list_tasks(document_id: Optional[int] = None):
    if document_id:
        return [t for t in verification_tasks_db if t["document_id"] == document_id]
    return verification_tasks_db
