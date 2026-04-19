/**
 * Seed script: creates/updates all seed users in Supabase Auth via Admin API.
 * Run with: node scripts/seed-auth-users.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxfypqyjngupocsxhhkf.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZnlwcXlqbmd1cG9jc3hoaGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQxOTE4NSwiZXhwIjoyMDkxOTk1MTg1fQ.GaSUoHIGxkv2vK6WNlU6_xkRL_vk6Oky1UL6HOMnY30';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PASSWORD = 'ZNHIPTest2026!';

const users = [
  { id: 'a1000000-0000-0000-0000-000000000001', email: 'admin@znhip.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000002', email: 'ministry@znhip.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000003', email: 'lusaka.officer@znhip.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000004', email: 'uth.admin@znhip.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000005', email: 'dr.banda@uth.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000006', email: 'dr.mwale@ndola.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000007', email: 'pharm.chanda@uth.gov.zm' },
  { id: 'a1000000-0000-0000-0000-000000000008', email: 'cidrz.research@znhip.gov.zm' },
];

for (const user of users) {
  // Try updating password first (user may already exist from SQL seed)
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: PASSWORD,
    email_confirm: true,
  });

  if (updateError) {
    // User doesn't exist yet, create them
    const { error: createError } = await supabase.auth.admin.createUser({
      user_metadata: {},
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
    });

    if (createError) {
      console.error(`❌ Failed to create ${user.email}:`, createError.message);
    } else {
      console.log(`✅ Created: ${user.email}`);
    }
  } else {
    console.log(`✅ Updated password for: ${user.email}`);
  }
}

console.log('\nDone! All users can now login with: ' + PASSWORD);
