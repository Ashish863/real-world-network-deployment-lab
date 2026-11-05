import express from 'express'
import mongoose from 'mongoose';
import { startServer } from './dbConnection.js';
import helmet from 'helmet';
const app=express();
app.set("trust proxy",1);
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Network Lab API",
    version: "1.0.0",
    status: "running"
  });
});

app.get("/api/request-info", (req, res) => {
  res.json({
    clientIp: req.ip,
    protocol: req.protocol,
    secure: req.secure,
    host: req.hostname
  });
});


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "network-lab-api",
    timestamp: new Date().toISOString()
  });
});


app.get("/api/db-health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    database: "MongoDB",
    status: connected ? "CONNECTED" : "DISCONNECTED"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
  startServer()
});
