fetch("http://127.0.0.1:8000/api/weather?lat=19.076&lon=72.8777", {
  headers: {
    "Origin": "http://localhost:3000"
  }
}).then(res => {
  console.log("Status:", res.status);
  return res.json();
}).then(data => {
  console.log("Data:", data);
}).catch(err => {
  console.error("Error:", err);
});
