#!/usr/bin/env node

// 解析命令行参数
const args = process.argv.slice(2);

// 初始化环境变量
let envVars = {};

// 检查命令行参数并设置相应的环境变量
args.forEach(arg => {
  if (arg === '--scan' || arg === '-s') {
    envVars.VITE_SCAN_ENABLED = 'true';
  } else if (arg === '--grab' || arg === '-g') {
    envVars.VITE_GRAB_ENABLED = 'true';
  } else if (arg.startsWith('--port=')) {
    const port = arg.split('=')[1];
    envVars.PORT = port;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: npm run dev [options]

Options:
  --scan, -s      Enable React Scan for performance analysis
  --grab, -g      Enable React Grab for element inspection
  --port=<port>   Specify port number (default: 3000)
  --help, -h      Show this help message

Examples:
  npm run dev              # Start with no extra tools
  npm run dev --scan       # Start with React Scan enabled
  npm run dev --grab       # Start with React Grab enabled
  npm run dev --scan --grab # Start with both tools enabled
  npm run dev --port=3001  # Start on port 3001
`);
    process.exit(0);
  }
});

// 设置默认端口
if (!envVars.PORT) {
  envVars.PORT = '3000';
}

// 使用exec来执行带有环境变量的命令
import { spawn } from 'child_process';

// 创建环境变量对象，合并当前环境
const env = { ...process.env, ...envVars };

// 准备vite命令参数
const viteArgs = ['--port', envVars.PORT];

// 启动vite进程
const viteProcess = spawn('npx', ['vite', ...viteArgs], {
  stdio: 'inherit',
  env: env
});

viteProcess.on('error', (err) => {
  console.error('Failed to start vite:', err.message);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  process.exit(code);
});