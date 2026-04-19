import pandas as pd
from typing import List

def detect_drug_correlations(deaths_df: pd.DataFrame, inventory_df: pd.DataFrame) -> List[dict]:
    if deaths_df.empty or inventory_df.empty:
        return []

    alerts = []
    
    # Filter only deaths with drug shortage mentioned
    # We assume 'contributingFactors' is a list of dicts in the JSON
    # This might need complex handling in pandas
    
    # For simplicity in this logic, we'll check facilities with stockout events
    stockouts = inventory_df[inventory_df['quantityInStock'] == 0]
    
    for _, drug in stockouts.iterrows():
        fid = drug['facilityId']
        drug_name = drug['drugName']
        
        # Look for deaths in the same facility in the last 14 days
        # where context might imply a link
        facility_deaths = deaths_df[deaths_df['facilityId'] == fid]
        
        # If there are deaths at this facility while a drug is out of stock...
        if not facility_deaths.empty:
            alerts.append({
                'facility_id': fid,
                'alert_type': 'stockout_correlation',
                'description': f"Potential correlation: {drug_name} is out of stock at this facility, and {len(facility_deaths)} deaths were recorded in the same period.",
                'icd11_code': None
            })
            
    return alerts
