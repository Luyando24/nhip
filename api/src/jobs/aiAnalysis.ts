import axios from 'axios';
import cron from 'node-cron';
import { query } from '../config/db';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const runAiAnalysis = async () => {
  console.log('Starting AI Analysis job...');
  
  try {
    // 1. Fetch data from DB (last 90 days)
    const deathsResult = await query(
      `SELECT d.*, f.province 
       FROM death_records d 
       JOIN facilities f ON d.facility_id = f.id 
       WHERE d.time_of_death > now() - interval '90 days'`,
      []
    );
    
    const inventoryResult = await query(
      'SELECT * FROM drug_inventory',
      []
    );

    // 2. Call AI Microservice
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      deaths: deathsResult.rows,
      inventory: inventoryResult.rows
    });

    const { alerts, proposals } = aiResponse.data;

    // 3. Save Alerts
    for (const alert of alerts) {
      await query(
        `INSERT INTO mortality_alerts 
         (facility_id, alert_type, description, icd11_code, baseline_rate, observed_rate, period_start, period_end) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          alert.facility_id, alert.alert_type, alert.description, 
          alert.icd11_code, alert.baseline_rate, alert.observed_rate,
          alert.period_start, alert.period_end
        ]
      );
    }

    // 4. Save Proposals
    for (const prop of proposals) {
      await query(
        `INSERT INTO research_proposals 
         (title, summary, evidence_basis, priority_score, icd11_codes_involved) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [
          prop.title, prop.summary, prop.evidence_basis, 
          prop.priority_score, prop.icd11_codes_involved
        ]
      );
    }

    console.log(`AI Analysis complete! Generated ${alerts.length} alerts and ${proposals.length} proposals.`);
    return aiResponse.data;

  } catch (error: any) {
    console.error('AI Analysis job failed:', error.message);
    throw error;
  }
};

// Schedule: 02:00 AM daily
cron.schedule('0 2 * * *', runAiAnalysis);
