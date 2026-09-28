-- migration_001_auditlogs_jsonb.sql
-- Run this against the Verde Postgres database to optimize DeltaData queries

BEGIN;

-- 1. Alter the column type from TEXT (or JSON) to JSONB
-- Using USING clause to ensure safe cast of existing string data
ALTER TABLE "AuditLogs" 
ALTER COLUMN "DeltaData" SET DATA TYPE JSONB 
USING "DeltaData"::JSONB;

-- 2. Create a GIN index on the new JSONB column
-- This allows blazing fast querying inside the JSON payload for analytics
CREATE INDEX idx_auditlogs_deltadata_gin 
ON "AuditLogs" USING GIN ("DeltaData");

COMMIT;
