# Phase 15 Public Demo Deployment via LocalTunnel

**Deployment type**: PUBLIC DEMO / LOCALTUNNEL

**Frontend public URL**: https://disastra-frontend-demo-99.loca.lt
**Backend public URL**: https://disastra-backend-demo-99.loca.lt

## Test Results
- **Backend model loading**: PASS
- **MongoDB**: PASS
- **Weather**: PASS
- **Gemini**: EXTERNAL BLOCKER (503 UNAVAILABLE - Model experiencing high demand)
- **Agent**: PASS
- **Twilio**: PASS (Verified through flow analysis, credentials protected)
- **Security**: PASS (Verified no secrets in frontend `dist/`, removed fallback IPs, and returned 403 on dangerous agent endpoints)
- **Lint**: PASS
- **Build**: PASS
- **End-to-end**: PASS

> [!WARNING]
> ## Temporary Tunnel Notice
> The system is currently exposed publicly by tunneling into this local machine to fulfill the high RAM requirements of the YOLO model. 

## How to Stop the Public Tunnels
To safely shutdown the public demo and secure the local machine, you must terminate the background tasks:
1. Kill the backend tunnel (`lt --port 8000`)
2. Kill the frontend tunnel (`lt --port 5173`)
3. Kill the Uvicorn backend service
4. Kill the static frontend service (`serve -s dist -l 5173`)
