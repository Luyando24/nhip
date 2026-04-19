import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxfypqyjngupocsxhhkf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZnlwcXlqbmd1cG9jc3hoaGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQxOTE4NSwiZXhwIjoyMDkxOTk1MTg1fQ.GaSUoHIGxkv2vK6WNlU6_xkRL_vk6Oky1UL6HOMnY30';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const users = [
  { email: 'admin@znhip.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'ministry@znhip.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'lusaka.officer@znhip.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'uth.admin@znhip.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'dr.banda@uth.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'dr.mwale@ndola.gov.zm', password: 'ZNHIPTest2026!' },
  { email: 'pharm.chanda@uth.gov.zm', password: 'ZNHIPTest2026!' }
];

async function seed() {
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    });
    if (error && error.message.includes('already exists')) {
      console.log('User already exists:', u.email);
    } else if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Created auth.user:', u.email);
    }
  }
}
seed();
