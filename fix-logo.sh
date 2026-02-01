#!/bin/bash

echo "================================"
echo "   Logo Fix Script"
echo "================================"
echo ""

echo "[1/3] Running fix-logo-public.js..."
cd backend
node fix-logo-public.js

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to run fix script!"
    exit 1
fi

echo ""
echo "================================"
echo "[2/3] Backend Status"
echo "================================"
echo ""
echo "Please restart backend manually:"
echo "  1. Press Ctrl+C in backend terminal"
echo "  2. Run: npm start"
echo ""
read -p "Press Enter after restarting backend..."

echo ""
echo "================================"
echo "[3/3] Browser Cache Instructions"
echo "================================"
echo ""
echo "Please clear browser cache:"
echo "  1. Press F12 in browser"
echo "  2. Go to Application tab"
echo "  3. Clear Local Storage"
echo "  4. Press Ctrl+Shift+R for hard reload"
echo ""
echo "After clearing cache, upload logo from Admin Panel."
echo ""
read -p "Press Enter to continue..."

cd ..
echo ""
echo "================================"
echo "   Fix Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "  1. Go to Admin Panel"
echo "  2. Settings -> Branding tab"
echo "  3. Upload logo"
echo "  4. Click Save Settings"
echo "  5. Logo will appear!"
echo ""

