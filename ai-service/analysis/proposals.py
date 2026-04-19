import pandas as pd
from typing import List

def generate_proposals(deaths_df: pd.DataFrame) -> List[dict]:
    if deaths_df.empty:
        return []

    # Count deaths per ICD-11 code
    counts = deaths_df.groupby(['primaryCauseIcd11', 'primaryCauseLabel']).size().reset_index(name='count')
    top_5 = counts.sort_values(by='count', ascending=False).head(5)

    proposals = []
    for _, row in top_5.iterrows():
        code = row['primaryCauseIcd11']
        label = row['primaryCauseLabel']
        count = row['count']
        
        # Calculate scores
        volume_score = min(count / 20.0, 1.0) * 0.4
        # Spread: number of unique provinces
        provinces = deaths_df[deaths_df['primaryCauseIcd11'] == code]['province'].nunique() if 'province' in deaths_df.columns else 1
        spread_score = min(provinces / 10.0, 1.0) * 0.3
        
        priority_score = volume_score + spread_score + 0.3 # Constant for trend for now
        
        proposals.append({
            'title': f"Assessment of contributing factors for {label} mortality",
            'summary': f"An evidence-based study into the rising or high burden of {label} (ICD-11: {code}) across Zambia.",
            'evidence_basis': f"National death count of {count} records in analysis period.",
            'priority_score': round(priority_score, 2),
            'icd11_codes_involved': [code]
        })
        
    return sorted(proposals, key=lambda x: x['priority_score'], reverse=True)
创新
