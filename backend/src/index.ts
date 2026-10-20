import dotenv from 'dotenv';
import { createServer } from './api/server.js';

dotenv.config();

const port = process.env.PORT 
  ? parseInt(process.env.PORT, 10) 
  : (process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 3001);
const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;
const rpcUrl = process.env.SEPOLIA_RPC_URL;

const { app, signer } = createServer({
  agentPrivateKey,
  rpcUrl
});

app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(` SupplyRight AI — Backend & Policy Engine Service`);
  console.log(`======================================================`);
  console.log(` Server running on: http://localhost:${port}`);
  console.log(` Agent Wallet Address: ${signer.getAddress()}`);
  console.log(` Network: Ethereum Sepolia (Chain ID 11155111)`);
  console.log(` SSE Stream: http://localhost:${port}/api/events/stream`);
  console.log(` Audit Trail: http://localhost:${port}/api/audit`);
  console.log(`======================================================\n`);
});
