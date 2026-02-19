const { spawn } = require('child_process');
const path = require('path');

const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, '../frontend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3000', BROWSER: 'none' }
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('error', (e) => console.error('Backend error:', e));
frontend.on('error', (e) => console.error('Frontend error:', e));
