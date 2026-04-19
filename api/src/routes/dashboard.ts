import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/mortality', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user!;
  try {
    // Current month deaths vs last month
    const trend = await query(
      `WITH monthly_counts AS (
        SELECT 
          date_trunc('month', time_of_death) as month,
          count(*) as count
        FROM death_records
        GROUP BY 1
      )
      SELECT 
        (SELECT count FROM monthly_counts WHERE month = date_trunc('month', now())) as current_month,
        (SELECT count FROM monthly_counts WHERE month = date_trunc('month', now() - interval '1 month')) as last_month`,
      [],
      user
    );

    const topCauses = await query(
      `SELECT primary_cause_icd11 as code, primary_cause_label as label, count(*) as count
       FROM death_records
       GROUP BY 1, 2
       ORDER BY count DESC
       LIMIT 5`,
      [],
      user
    );

    const byProvince = await query(
      `SELECT f.province, count(*) as count
       FROM death_records d
       JOIN facilities f ON d.facility_id = f.id
       GROUP BY 1`,
      [],
      user
    );

    res.json({
      success: true,
      data: {
        trend: trend.rows[0],
        topCauses: topCauses.rows,
        byProvince: byProvince.rows
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Dashboard data failed' });
  }
});

export default router;
