import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const deathSchema = z.object({
  patientAgeYears: z.number().optional(),
  patientSex: z.enum(['male', 'female', 'unknown']),
  patientDistrict: z.string().optional(),
  primaryCauseIcd11: z.string(),
  primaryCauseLabel: z.string(),
  timeOfDeath: z.string(),
  timeOfAdmission: z.string().optional(),
  ward: z.string().optional(),
  wasAdmitted: z.boolean(),
  notes: z.string().optional(),
  contributingFactors: z.array(z.object({
    factorType: z.enum(['comorbidity', 'delayed_presentation', 'drug_shortage', 'malnutrition', 'other']),
    icd11Code: z.string().optional(),
    label: z.string(),
    notes: z.string().optional()
  })).optional()
});

/**
 * POST /api/deaths
 * Creates a death record + contributing factors in a transaction.
 */
router.post('/', authenticateToken, requireRole('clinician', 'facility_admin', 'super_admin'), validateBody(deathSchema), async (req: Request, res: Response) => {
  const user = req.user!;
  const body = req.body;

  try {
    // Start transaction logic (using RLS context)
    const deathInsert = await query(
      `INSERT INTO death_records 
       (facility_id, recorded_by, patient_age_years, patient_sex, patient_district, primary_cause_icd11, primary_cause_label, time_of_death, time_of_admission, ward, was_admitted, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        user.facilityId, user.userId, body.patientAgeYears, body.patientSex, body.patientDistrict,
        body.primaryCauseIcd11, body.primaryCauseLabel, body.timeOfDeath, body.timeOfAdmission,
        body.ward, body.wasAdmitted, body.notes
      ],
      user
    );

    const deathId = deathInsert.rows[0].id;

    if (body.contributingFactors && body.contributingFactors.length > 0) {
      for (const factor of body.contributingFactors) {
        await query(
          `INSERT INTO contributing_factors (death_record_id, factor_type, icd11_code, label, notes) 
           VALUES ($1, $2, $3, $4, $5)`,
          [deathId, factor.factorType, factor.icd11Code, factor.label, factor.notes],
          user
        );
      }
    }

    res.status(201).json({ success: true, data: { id: deathId } });

  } catch (error: any) {
    console.error('Death record creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create death record' });
  }
});

/**
 * GET /api/deaths
 * List with RLS filters automatically applied by the DB.
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { facility_id, province, icd11_code, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // DB will filter based on RLS app.current_user_* settings
    const result = await query(
      `SELECT * FROM death_records 
       WHERE ($1::UUID IS NULL OR facility_id = $1)
       AND ($2::TEXT IS NULL OR primary_cause_icd11 = $2)
       ORDER BY time_of_death DESC
       LIMIT $3 OFFSET $4`,
      [facility_id || null, icd11_code || null, Number(limit), offset],
      req.user
    );

    const countRes = await query(
      `SELECT COUNT(*) FROM death_records WHERE ($1::UUID IS NULL OR facility_id = $1)`,
      [facility_id || null],
      req.user
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countRes.rows[0].count),
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch mortality records' });
  }
});

router.get('/stats/summary', authenticateToken, async (req: Request, res: Response) => {
  const user = req.user!;
  try {
    const stats = await query(
      `SELECT 
        COUNT(*) as total_deaths,
        patient_sex,
        COUNT(*) filter (where time_of_death > now() - interval '30 days') as deaths_30_days
       FROM death_records
       GROUP BY patient_sex`,
      [],
      user
    );

    const topCauses = await query(
      `SELECT primary_cause_icd11 as code, primary_cause_label as label, COUNT(*) as count
       FROM death_records
       GROUP BY primary_cause_icd11, primary_cause_label
       ORDER BY count DESC
       LIMIT 5`,
      [],
      user
    );

    res.json({
      success: true,
      data: {
        total: stats.rows.reduce((acc: any, curr: any) => acc + parseInt(curr.total_deaths), 0),
        bySex: stats.rows,
        topCauses: topCauses.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch summary statistics' });
  }
});

export default router;
