### 1️⃣ Requirements

Please make sure you have installed:

- [Python](https://www.python.org/) **3.10 or higher**
- [Node.js](https://nodejs.org/) **v20 or higher**
- npm (comes with Node.js) or yarn/pnpm
- [virtualenv](https://virtualenv.pypa.io/) (recommended for backend setup)

Check your versions:
```bash
python3 -V
node -v
npm -v
```

### 2️⃣ Clone the Repository
```
https://github.com/lai-yingchun/StarMatch.git
```
```
cd starmatch
```

### 3️⃣ Backend Setup (Run this first)
```
cd backend
python3 -m venv venv
source venv/bin/activate      # (macOS / Linux)
venv\Scripts\activate         # (Windows)

pip install -r requirements.txt
```
Create a .env file in the backend directory:
```
OPENAI_API_KEY=your_api_key_here
```

Then start the FastAPI server:
```
uvicorn main:app
```

This will start the backend at:
=> http://127.0.0.1:8000

### 4️⃣ Frontend Setup
Open a new terminal (keep backend running):
```
cd frontend
npm install
npm run dev
```
This will start the frontend at:
=> http://localhost:5173

