import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'death_records',
      columns: [
        { name: 'patient_age_years', type: 'number', isOptional: true },
        { name: 'patient_sex', type: 'string' },
        { name: 'patient_district', type: 'string', isOptional: true },
        { name: 'primary_cause_icd11', type: 'string' },
        { name: 'primary_cause_label', type: 'string' },
        { name: 'time_of_death', type: 'number' },
        { name: 'ward', type: 'string', isOptional: true },
        { name: 'was_admitted', type: 'boolean' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' }, // 'pending' | 'synced' | 'error'
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'drug_transactions',
      columns: [
        { name: 'drug_inventory_id', type: 'string' },
        { name: 'transaction_type', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
