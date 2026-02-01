#!/bin/bash

echo "Loading dummy data into Keyhost Homes database..."
echo

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL is not installed or not in PATH"
    echo "Please install MySQL and add it to your system PATH"
    exit 1
fi

echo "MySQL found. Loading dummy data..."
echo

# Load the dummy data
mysql -u root -p keyhost_booking_system < dummy-data.sql

if [ $? -eq 0 ]; then
    echo
    echo "✅ Dummy data loaded successfully!"
    echo
    echo "Test accounts created:"
    echo "- Admin: admin@keyhost.com / password123"
    echo "- Property Owner: owner1@keyhost.com / password123"
    echo "- Guest: guest1@keyhost.com / password123"
    echo
else
    echo
    echo "❌ Error loading dummy data. Please check the error messages above."
    echo
fi
