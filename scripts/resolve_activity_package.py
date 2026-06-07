from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import argparse
import json
import uuid

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "controlled-repository" / "manifests" / "owner-supplied-activity-sources.json"
RECEIPTS = ROOT / "controlled-repository" / "consultation-receipts"

def digest(path):
    h = sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def resolve(activity, execution_id):
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assets = [a for a in manifest["assets"] if a["activity"] == activity]
    if not assets:
        raise SystemExit(f"BLOCKED: no controlled repository assets found for activity '{activity}'")

    consultations = []
    for asset in assets:
        original = ROOT / asset["originalRepositoryPath"]
        extracted = ROOT / asset["extractedRepositoryPath"]
        if not original.exists() or not extracted.exists():
            raise SystemExit(f"BLOCKED: repository asset missing: {asset['assetId']}")
        if digest(original) != asset["originalSha256"]:
            raise SystemExit(f"BLOCKED: original integrity failure: {asset['assetId']}")
        if digest(extracted) != asset["extractedSha256"]:
            raise SystemExit(f"BLOCKED: extracted integrity failure: {asset['assetId']}")
        consultations.append({
            "assetId": asset["assetId"],
            "assetType": asset["assetType"],
            "status": asset["status"],
            "effectiveForExecution": asset["effectiveForExecution"],
            "originalSha256": asset["originalSha256"],
            "extractedSha256": asset["extractedSha256"],
            "consultedAt": datetime.now(timezone.utc).isoformat(),
        })

    required = {"sop", "skill"}
    present = {item["assetType"] for item in consultations}
    missing = sorted(required - present)
    result = "READY_FOR_DRAFT_PLANNING" if not missing else "BLOCKED_MISSING_REQUIRED_PACKAGE"

    receipt = {
        "receiptId": str(uuid.uuid4()),
        "executionId": execution_id,
        "activity": activity,
        "repositoryManifest": str(MANIFEST.relative_to(ROOT)).replace("\\", "/"),
        "consultedPackages": consultations,
        "missingRequiredAssetTypes": missing,
        "result": result,
        "note": "Owner-supplied source status permits draft planning only. Effective production execution requires explicit approval and effective status.",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    RECEIPTS.mkdir(parents=True, exist_ok=True)
    receipt_path = RECEIPTS / f"{execution_id}.json"
    receipt_path.write_text(json.dumps(receipt, indent=2), encoding="utf-8")
    print(json.dumps(receipt, indent=2))
    if missing:
        raise SystemExit(2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("activity")
    parser.add_argument("--execution-id", default=str(uuid.uuid4()))
    args = parser.parse_args()
    resolve(args.activity, args.execution_id)
