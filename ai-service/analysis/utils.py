import pandas as pd
from datetime import datetime, timedelta

def parse_deaths_df(deaths_json):
    if not deaths_json:
        return pd.DataFrame()
    df = pd.DataFrame(deaths_json)
    if not df.empty:
        df['timeOfDeath'] = pd.to_datetime(df['timeOfDeath'])
    return df

def parse_inventory_df(inventory_json):
    if not inventory_json:
        return pd.DataFrame()
    df = pd.DataFrame(inventory_json)
    if not df.empty:
        df['updatedAt'] = pd.to_datetime(df['updatedAt'])
        df['expiryDate'] = pd.to_datetime(df['expiryDate'])
    return df

def date_window(df, date_col, days_ago_start, days_ago_end=0):
    now = datetime.now()
    start_date = now - timedelta(days=days_ago_start)
    end_date = now - timedelta(days=days_ago_end)
    return df[(df[date_col] >= start_date) & (df[date_col] <= end_date)]
