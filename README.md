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
cd Starmatch
```

### 3️⃣ Backend Setup (Run this first)

Change directory to ```backend```
```
cd backend
```
Create a virtual environment
```
python3 -m venv venv
```

Activate the virtual environment on macOS / Linux
```
source venv/bin/activate
```
on Windows
```
venv\Scripts\activate
```
Install project dependencies

```
pip install -r requirements.txt
```
Create a .env file in the backend directory:
```
OPENAI_API_KEY=your_api_key_here
VOYAGE_API_KEY=your_api_key_here
VOYAGE_MODEL=voyage-3.5
```

Then start the FastAPI server:
```
uvicorn main:app
```

This will start the backend at:
=> http://127.0.0.1:8000

### 4️⃣ Frontend Setup
Open a new terminal (keep backend running):

Change directory to ```frontend```
```
cd frontend
```

Install project dependencies

```
npm install
```
Start the development server
```
npm run dev
```
This will start the frontend at:
=> http://localhost:5173




