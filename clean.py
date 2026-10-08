with open('src/services/api.ts', 'r') as f:
    c = f.read()

c = c.replace("USE_REAL_BACKEND ? `${API_BASE}/api/alerts/test` : 'http://127.0.0.1:8000/api/alerts/test'", "`${API_BASE}/api/alerts/test`")
c = c.replace("USE_REAL_BACKEND ? `${API_BASE}/api/agent/status` : 'http://127.0.0.1:8000/api/agent/status'", "`${API_BASE}/api/agent/status`")
c = c.replace("USE_REAL_BACKEND ? `${API_BASE}/api/agent/start` : 'http://127.0.0.1:8000/api/agent/start'", "`${API_BASE}/api/agent/start`")
c = c.replace("USE_REAL_BACKEND ? `${API_BASE}/api/agent/stop` : 'http://127.0.0.1:8000/api/agent/stop'", "`${API_BASE}/api/agent/stop`")
c = c.replace("USE_REAL_BACKEND ? `${API_BASE}/api/agent/cycle` : 'http://127.0.0.1:8000/api/agent/cycle'", "`${API_BASE}/api/agent/cycle`")

c = c.replace("USE_REAL_BACKEND \n      ? `${API_BASE}/api/weather`\n      : 'http://127.0.0.1:8000/api/weather'", "`${API_BASE}/api/weather`")
c = c.replace("USE_REAL_BACKEND \n      ? `${API_BASE}/api/analyze/disaster`\n      : 'http://127.0.0.1:8000/api/analyze/disaster'", "`${API_BASE}/api/analyze/disaster`")
c = c.replace("USE_REAL_BACKEND \n      ? `${API_BASE}/api/ai/brief`\n      : 'http://127.0.0.1:8000/api/ai/brief'", "`${API_BASE}/api/ai/brief`")

with open('src/services/api.ts', 'w') as f:
    f.write(c)
