import numpy as np
import pandas as pd
import xgboost as xgb
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(
    title="ClinCommand OS™ - AI Risk-Based Monitoring Engine",
    description="FastAPI microservice for XGBoost scoring and SHAP explainability",
    version="15.1"
)

# Global variables for model and explainer
model = None
explainer = None
feature_names = ["deviations", "missed_visits", "open_findings", "subject_age", "adverse_events"]

@app.on_event("startup")
def train_mock_model():
    global model, explainer
    # Generate synthetic training data for GxP validation reproducibility
    np.random.seed(42)
    X = np.random.randint(0, 10, size=(100, len(feature_names)))
    # Target value based on weighted risk rules
    y = 0.4 * X[:, 0]*10 + 0.3 * X[:, 1]*25 + 0.3 * X[:, 2]*20 + np.random.normal(0, 5, 100)
    y = np.clip(y, 0, 100)

    # Train a simple XGBoost Regressor
    model = xgb.XGBRegressor(n_estimators=15, max_depth=3, random_state=42)
    model.fit(X, y)
    
    # Initialize Tree SHAP explainer
    explainer = shap.Explainer(model, X)
    print("ClinCommand OS™ - XGBoost model and SHAP explainability engine booted successfully.")

class ScoreRequest(BaseModel):
    id: int
    deviations: int
    missed_visits: int
    open_findings: int
    subject_age: int = 45
    adverse_events: int = 1

@app.get("/health")
def read_health():
    return {"status": "HEALTHY", "service": "rbm-ai-service"}

@app.post("/api/v1/rbm/score-study")
def score_study(req: ScoreRequest):
    return score_generic(req, "study")

@app.post("/api/v1/rbm/score-site")
def score_site(req: ScoreRequest):
    return score_generic(req, "site")

@app.post("/api/v1/rbm/score-subject")
def score_subject(req: ScoreRequest):
    return score_generic(req, "subject")

def score_generic(req: ScoreRequest, target_type: str):
    if model is None or explainer is None:
        raise HTTPException(status_code=500, detail="XGBoost model is not initialized.")
    
    input_data = np.array([[req.deviations, req.missed_visits, req.open_findings, req.subject_age, req.adverse_events]])
    df = pd.DataFrame(input_data, columns=feature_names)
    
    # Predict score
    pred_score = float(model.predict(df)[0])
    pred_score = max(0.0, min(100.0, pred_score))
    
    # Compute SHAP values
    shap_values = explainer(df)
    contributions = {}
    for i, name in enumerate(feature_names):
        contributions[name] = float(shap_values.values[0][i])
        
    return {
        "success": True,
        "target_type": target_type,
        "target_id": req.id,
        "overall_score": round(pred_score, 2),
        "feature_contributions": contributions
    }
