-- Database initialization script
-- This script will be run when PostgreSQL container starts

-- Create additional databases if needed
-- CREATE DATABASE modern_lms_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- Note: Prisma will handle table creation via migrations

-- Set default timezone
SET timezone = 'UTC';