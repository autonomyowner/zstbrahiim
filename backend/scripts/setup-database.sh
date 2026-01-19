#!/bin/bash
################################################################################
# ZST Backend - Database Setup Script
#
# This script creates the PostgreSQL database and user for ZST backend
################################################################################

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  🗄️  PostgreSQL Database Setup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Prompt for database password
echo -e "${YELLOW}Please enter a strong password for the database user:${NC}"
read -s DB_PASSWORD
echo ""
echo -e "${YELLOW}Confirm password:${NC}"
read -s DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

# Database configuration
DB_NAME="zst_db"
DB_USER="zst_user"

echo "Creating database and user..."
echo ""

# Create user and database
sudo -u postgres psql <<EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\q
EOF

echo -e "${GREEN}✓${NC} Database created successfully"
echo ""
echo "Database details:"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Host:     localhost"
echo "  Port:     5432"
echo ""
echo "Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""

# Save connection details to file
cat > /root/.zst-db-credentials <<EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=$DB_NAME
EOF

chmod 600 /root/.zst-db-credentials

echo -e "${GREEN}✓${NC} Credentials saved to /root/.zst-db-credentials"
echo ""
echo "════════════════════════════════════════════════════════════════"
