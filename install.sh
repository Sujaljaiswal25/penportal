#!/bin/bash

echo "========================================"
echo "   PenPortal - Installation Script"
echo "========================================"
echo ""

echo "Installing Server Dependencies..."
cd server
npm install express-validator
if [ $? -ne 0 ]; then
    echo "ERROR: Server installation failed!"
    exit 1
fi
echo "Server dependencies installed successfully!"
echo ""

echo "Installing Client Dependencies..."
cd ../client
npm install react-router-dom axios socket.io-client react-quill react-hot-toast lucide-react date-fns dompurify react-intersection-observer
if [ $? -ne 0 ]; then
    echo "ERROR: Client installation failed!"
    exit 1
fi
echo "Client dependencies installed successfully!"
echo ""

cd ..
echo "========================================"
echo "   Installation Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Open TWO terminal windows"
echo "2. Terminal 1: cd server && npm run dev"
echo "3. Terminal 2: cd client && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""
