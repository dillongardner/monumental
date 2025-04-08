#!/bin/bash

echo "🚀 Starting Monumental setup..."

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "Homebrew is not installed. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✓ Homebrew is installed"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    brew install node
else
    echo "✓ Node.js is installed"
fi

# Check for Python 3.13
if ! command -v python3.13 &> /dev/null; then
    echo "Python 3.13 is not installed. Installing Python 3.13..."
    brew install python@3.13
else
    echo "✓ Python 3.13 is installed"
fi

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "uv is not installed. Installing uv..."
    brew install uv
else
    echo "✓ uv is installed"
fi

echo "📦 Setting up frontend..."
cd frontend
npm install
npm run build

echo "🐍 Setting up backend..."
cd ../backend
uv venv --python 3.13
source .venv/bin/activate
uv pip install .

echo -e "\n✨ Installation complete!"
echo -e "\nTo run the application:"
echo -e "1. Start the backend:"
echo -e "   cd backend"
echo -e "   source .venv/bin/activate"
echo -e "   uvicorn server:app --host 0.0.0.0 --port 8000 --reload"
echo -e "\n2. In a new terminal, start the frontend:"
echo -e "   cd frontend"
echo -e "   npm start"
echo -e "\nThe application will be available at:"
echo -e "- Frontend: http://localhost:3000"
echo -e "- Backend: http://localhost:8000" 