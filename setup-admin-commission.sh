#!/bin/bash

# =============================================
# ADMIN COMMISSION SYSTEM SETUP SCRIPT
# =============================================
# This script sets up the admin commission system
# Run this after creating the database tables

echo "🚀 Setting up Admin Commission System..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Database connection details (update these as needed)
DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="keyhost_homes"

echo "📊 Creating admin commission system tables..."

# Run the SQL script
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < admin-commission-system.sql

if [ $? -eq 0 ]; then
    echo "✅ Admin commission system setup completed successfully!"
    echo ""
    echo "📋 What was created:"
    echo "   • admin_earnings table - tracks commission from each booking"
    echo "   • admin_earnings_summary table - monthly earnings summaries"
    echo "   • admin_payouts table - payout management"
    echo "   • Commission calculation trigger"
    echo "   • Monthly summary procedure"
    echo "   • System settings for commission rates"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Restart your backend server"
    echo "   2. Access /admin/earnings in the frontend"
    echo "   3. Configure commission rates in admin settings"
    echo "   4. Test with a booking to see commission calculation"
    echo ""
    echo "💰 Commission Features:"
    echo "   • Automatic commission calculation on booking creation"
    echo "   • Admin earnings dashboard with analytics"
    echo "   • Payment status tracking"
    echo "   • Monthly earnings summaries"
    echo "   • Payout management system"
else
    echo "❌ Failed to setup admin commission system"
    echo "Please check your database connection and try again"
    exit 1
fi
