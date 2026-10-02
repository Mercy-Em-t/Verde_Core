# Verde React Dashboard

This is the official React frontend for the Verde SDLC Engine. 
It communicates via REST API with the Node.js/Rust backend running on `localhost:3000`.

## Features
- Real-time fetching of isolated project instances.
- Deep routing (`react-router-dom`) into cryptographic Binder Passports.
- Deep routing into chronological Audit Trails.
- Clean CSS architecture without heavy dependencies.

## Running the Application
Ensure the `Verde_Frontend` backend API is running on Port 3000.

```bash
cd Verde_React_Dashboard
npm install
npm run dev
```

The UI will be available at [http://localhost:5173/](http://localhost:5173/).
