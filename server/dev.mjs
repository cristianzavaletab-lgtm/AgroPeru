import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const apiPort = process.env.API_PORT || '3001';
const common = { stdio: 'inherit', env: { ...process.env, API_PORT: apiPort } };
const api = spawn(process.execPath, ['server/index.mjs'], common);
const web = spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js'), '--host', '--port', '5173', '--strictPort'], common);

const stop = () => {
  if (!api.killed) api.kill();
  if (!web.killed) web.kill();
};

api.on('exit', code => { if (code) process.exitCode = code; stop(); });
web.on('exit', code => { if (code) process.exitCode = code; stop(); });
process.on('SIGINT', () => { stop(); process.exit(0); });
process.on('SIGTERM', () => { stop(); process.exit(0); });
