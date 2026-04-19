import axios from 'axios';

/**
 * Mobile Sync Service
 * Responsible for pushing local cached records to the ZNHIP API.
 */
class SyncService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /**
   * Pushes pending death records to the backend.
   */
  async syncDeathRecords(records: any[], authToken: string) {
    for (const record of records) {
      try {
        await axios.post(`${this.apiUrl}/api/deaths`, record, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // On success, the caller should update the local record status to 'synced'
        console.log(`Synced record ${record.id}`);
      } catch (error: any) {
        console.error(`Failed to sync record ${record.id}:`, error.message);
        // On error, mark status as 'error'
      }
    }
  }

  /**
   * Pushes pending drug transactions to the backend.
   */
  async syncTransactions(transactions: any[], authToken: string) {
    for (const tx of transactions) {
      try {
        await axios.post(`${this.apiUrl}/api/drugs/${tx.drug_inventory_id}/transaction`, tx, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`Synced transaction for drug ${tx.drug_inventory_id}`);
      } catch (error: any) {
        console.error(`Failed to sync transaction:`, error.message);
      }
    }
  }
}

export default new SyncService('https://api.znhip.gov.zm');
创新
