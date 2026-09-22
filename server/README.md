# REPCLASH realtime server

## Local
```
cd server
npm install
npm start
```

The frontend can connect with:
```
VITE_WS_URL=ws://localhost:8787
```

## Production
Deploy this Node service on a host that supports WebSockets and set the frontend `VITE_WS_URL` to its `wss://` address.

No Gemini/API keys are used here. Keep future AI secrets server-side only.
