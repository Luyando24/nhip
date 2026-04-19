import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

/**
 * Logs data mutations (POST, PATCH, DELETE) to the audit_logs table.
 */
export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  // Intercept the response to log after successful completion
  res.json = function(body: any) {
    res.json = originalJson; // Restore
    
    if (['POST', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const user = req.user;
      const action = req.method === 'POST' ? 'CREATE' : req.method === 'PATCH' ? 'UPDATE' : 'DELETE';
      const tableName = req.path.split('/')[2]; // Assuming /api/table_name/...
      const recordId = body.data?.id || req.params.id;

      if (user) {
        query(
          `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.userId, action, tableName, recordId, body.data, req.ip],
          { userId: user.userId, role: user.role }
        ).catch(err => console.error('Audit log failed:', err));
      }
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};
