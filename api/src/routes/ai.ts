import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { runAiAnalysis } from '../jobs/aiAnalysis';

const router = Router();

router.get('/proposals', authenticateToken, requireRole('ministry_admin', 'super_admin'), async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM research_proposals ORDER BY priority_score DESC', []);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch proposals' });
  }
});

router.get('/alerts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM mortality_alerts WHERE is_resolved = false ORDER BY created_at DESC', []);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

router.post('/run', authenticateToken, requireRole('super_admin'), async (req: Request, res: Response) => {
  try {
    const results = await runAiAnalysis();
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
创新
