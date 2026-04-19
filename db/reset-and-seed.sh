#!/bin/bash

# Database connection variables (should match .env)
DB_NAME=${DB_NAME:-znhip}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}

echo "Resetting database: $DB_NAME..."

# Drop and recreate schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Enable Extension
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

# Run scripts in order
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/schema.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/rls.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/indexes.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f db/seed.sql

echo "Database reset and seeded successfully!"
