from fastapi import FastAPI, Body
from typing import List, Optional
from datetime import datetime
import pandas as pd
import analysis.utils as utils
import analysis.anomaly as anomaly
import analysis.correlation as correlation
import analysis.proposals as proposals

app = FastAPI(title="ZNHIP AI Research Intelligence Engine")

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/analyze")
def analyze(
    deaths: List[dict] = Body(...),
    inventory: List[dict] = Body(...),
    lookback_days: int = 90
):
    # Parse inputs to DataFrames
    deaths_df = pd.DataFrame(deaths)
    inventory_df = pd.DataFrame(inventory)
    
    # Run analysis logic
    anomalies = anomaly.detect_anomalies(deaths_df)
    correlations = correlation.detect_drug_correlations(deaths_df, inventory_df)
    new_proposals = proposals.generate_proposals(deaths_df)
    
    return {
        "analysis_timestamp": datetime.now().isoformat(),
        "alerts": anomalies + correlations,
        "proposals": new_proposals,
        "stats": {
            "deaths_analysed": len(deaths),
            "inventory_records": len(inventory),
            "alerts_generated": len(anomalies) + len(correlations),
            "proposals_generated": len(new_proposals)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
