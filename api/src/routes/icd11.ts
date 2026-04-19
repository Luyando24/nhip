import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import redis from '../config/redis';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/search', authenticateToken, async (req: Request, res: Response) => {
  const q = req.query.q as string;

  if (!q || q.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const cacheKey = `icd11:search:${q.toLowerCase()}`;

  try {
    // Try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    // DB search
    const result = await query(
      `SELECT code, label, chapter 
       FROM icd11_codes 
       WHERE (label ILIKE $1 OR code ILIKE $1) AND is_active = true
       LIMIT 10`,
      [`%${q}%`]
    );

    const data = result.rows;

    // Cache results for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(data));

    res.json({ success: true, data });

  } catch (error) {
    console.error('ICD11 search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search codes' });
  }
});

export default router;
