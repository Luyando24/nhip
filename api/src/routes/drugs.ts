import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const drugSchema = z.object({
  drugName: z.string(),
  genericName: z.string().optional(),
  batchNumber: z.string().optional(),
  quantityInStock: z.number(),
  unit: z.string(),
  expiryDate: z.string(),
  reorderLevel: z.number().default(50),
  facilityId: z.string().uuid()
});

const transactionSchema = z.object({
  transactionType: z.enum(['received', 'dispensed', 'expired', 'adjusted']),
  quantity: z.number(),
  notes: z.string().optional()
});

/**
 * GET /api/drugs
 * Scoped by RLS.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { below_reorder, expiring_soon } = req.query;
    let sql = 'SELECT * FROM drug_inventory WHERE 1=1';
    const params: any[] = [];

    if (below_reorder === 'true') {
      sql += ' AND quantity_in_stock < reorder_level';
    }
    if (expiring_soon === 'true') {
      sql += ' AND expiry_date <= now() + interval \'30 days\'';
    }

    const result = await query(sql, params, req.user);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/drugs/:id/transaction
 * Handles stock updates and transaction logging.
 */
router.post('/:id/transaction', authenticateToken, requireRole('pharmacist', 'facility_admin', 'super_admin'), validateBody(transactionSchema), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { transactionType, quantity, notes } = req.body;
  const user = req.user!;

  try {
    const drugRes = await query('SELECT quantity_in_stock FROM drug_inventory WHERE id = $1', [id], user);
    if (drugRes.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Drug not found' });
    }

    const currentStock = drugRes.rows[0].quantity_in_stock;
    let newStock = currentStock;

    if (transactionType === 'dispensed' || transactionType === 'expired') {
      if (currentStock < quantity) {
        return res.status(400).json({ success: false, error: 'Insufficient stock' });
      }
      newStock -= quantity;
    } else if (transactionType === 'received') {
      newStock += quantity;
    } else if (transactionType === 'adjusted') {
      newStock = quantity;
    }

    // Update stock and Log transaction
    await query(
      'UPDATE drug_inventory SET quantity_in_stock = $1, updated_at = now(), last_updated_by = $2 WHERE id = $3',
      [newStock, user.userId, id],
      user
    );

    await query(
      'INSERT INTO drug_transactions (drug_inventory_id, facility_id, transaction_type, quantity, notes, performed_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, user.facilityId, transactionType, quantity, notes, user.userId],
      user
    );

    res.json({ success: true, data: { newQuantity: newStock } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Transaction failed' });
  }
});

router.get('/alerts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const expiring = await query(
      'SELECT drug_name, expiry_date, quantity_in_stock FROM drug_inventory WHERE expiry_date <= now() + interval \'30 days\'',
      [],
      req.user
    );
    const lowStock = await query(
      'SELECT drug_name, quantity_in_stock, reorder_level FROM drug_inventory WHERE quantity_in_stock < reorder_level',
      [],
      req.user
    );

    res.json({
      success: true,
      data: {
        expiringSoon: expiring.rows,
        belowReorder: lowStock.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

export default router;
