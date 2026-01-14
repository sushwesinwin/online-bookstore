-- Initial database setup
-- This file is executed when the PostgreSQL container starts

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- These will be created after migrations run

-- Note: Prisma will handle the actual table creation through migrations
-- This file is mainly for database-level configurations and extensions