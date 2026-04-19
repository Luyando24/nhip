import pandas as pd
from typing import List

def detect_anomalies(deaths_df: pd.DataFrame) -> List[dict]:
    if deaths_df.empty:
        return []

    # Filter last 90 days
    now = pd.Timestamp.now(tz='UTC')
    deaths_df['timeOfDeath'] = pd.to_datetime(deaths_df['timeOfDeath']).dt.tz_convert('UTC')
    
    current_window = deaths_df[deaths_df['timeOfDeath'] > now - pd.Timedelta(days=30)]
    baseline_window = deaths_df[(deaths_df['timeOfDeath'] <= now - pd.Timedelta(days=30)) & 
                                (deaths_df['timeOfDeath'] > now - pd.Timedelta(days=90))]

    # Group by facility and icd11
    current_counts = current_window.groupby(['facilityId', 'primaryCauseIcd11', 'primaryCauseLabel']).size().reset_index(name='current_count')
    baseline_counts = baseline_window.groupby(['facilityId', 'primaryCauseIcd11']).size().reset_index(name='baseline_total')

    # Merge and calculate average baseline (per 30 days)
    merged = pd.merge(current_counts, baseline_counts, on=['facilityId', 'primaryCauseIcd11'], how='left')
    merged['baseline_total'] = merged['baseline_total'].fillna(0)
    merged['baseline_avg'] = merged['baseline_total'] / 2.0 # (90-30)/30 = 2 periods

    alerts = []
    for _, row in merged.iterrows():
        # Condition: current > baseline * 1.25 AND current >= 3
        if row['current_count'] >= 3 and row['current_count'] > (row['baseline_avg'] * 1.25):
            alerts.append({
                'facility_id': row['facilityId'],
                'alert_type': 'spike',
                'icd11_code': row['primaryCauseIcd11'],
                'description': f"Mortality spike detected for {row['primaryCauseLabel']}. {int(row['current_count'])} deaths in 30 days vs baseline of {row['baseline_avg']:.1f}.",
                'baseline_rate': row['baseline_avg'],
                'observed_rate': row['current_count'],
                'period_start': (now - pd.Timedelta(days=30)).isoformat(),
                'period_end': now.isoformat()
            })
            
    return alerts
创新
