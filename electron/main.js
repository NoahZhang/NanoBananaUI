const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let pythonProcess;
let isQuitting = false;

// 获取资源路径（开发模式和打包后路径不同）
function getResourcePath(relativePath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return path.join(__dirname, '..', relativePath);
}

// 启动 Python 后端
function startPythonBackend() {
  const pythonPath = app.isPackaged
    ? path.join(process.resourcesPath, 'python', 'venv', 'bin', 'python')
    : path.join(__dirname, '..', 'backend', 'venv', 'bin', 'python');

  const backendPath = getResourcePath('backend');
  const authPath = getResourcePath('auth');

  console.log('Starting Python backend...');
  console.log('Python path:', pythonPath);
  console.log('Backend path:', backendPath);

  pythonProcess = spawn(pythonPath, [
    '-m', 'uvicorn',
    'app.main:app',
    '--host', '127.0.0.1',
    '--port', '8000'
  ], {
    cwd: backendPath,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      // 确保能找到 auth 目录
      NANOBANANA_AUTH_PATH: authPath
    }
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Backend: ${data}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
    dialog.showErrorBox('Backend Error', `Failed to start Python backend: ${err.message}`);
  });

  pythonProcess.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (!isQuitting && code !== 0) {
      dialog.showErrorBox('Backend Error', `Python backend exited unexpectedly (code: ${code})`);
    }
  });
}

// 等待后端启动
function waitForBackend(maxRetries = 60) {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const checkHealth = () => {
      const req = http.get('http://127.0.0.1:8000/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Backend is ready!');
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.setTimeout(1000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      retries++;
      if (retries > maxRetries) {
        reject(new Error('Backend failed to start within timeout'));
      } else {
        console.log(`Waiting for backend... (${retries}/${maxRetries})`);
        setTimeout(checkHealth, 500);
      }
    };

    checkHealth();
  });
}

// 停止 Python 后端
function stopPythonBackend() {
  if (pythonProcess) {
    console.log('Stopping Python backend...');
    pythonProcess.kill('SIGTERM');

    // 如果 SIGTERM 没有效果，强制终止
    setTimeout(() => {
      if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.kill('SIGKILL');
      }
    }, 3000);
  }
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'NanoBananaUI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 加载前端
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'frontend', 'dist', 'index.html')
      : path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 显示启动画面
function showSplash() {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false
    }
  });

  splash.loadURL(`data:text/html,
    <html>
      <body style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        color: white;
        border-radius: 10px;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">🍌</div>
        <div style="font-size: 24px; font-weight: bold;">NanoBananaUI</div>
        <div style="margin-top: 20px; font-size: 14px;">Starting...</div>
      </body>
    </html>
  `);

  return splash;
}

// 应用启动
app.whenReady().then(async () => {
  const splash = showSplash();

  try {
    startPythonBackend();
    await waitForBackend();
    splash.close();
    createWindow();
  } catch (err) {
    splash.close();
    dialog.showErrorBox('Startup Error', err.message);
    app.quit();
  }
});

// macOS: 点击 dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    isQuitting = true;
    stopPythonBackend();
    app.quit();
  }
});

// 应用退出前
app.on('before-quit', () => {
  isQuitting = true;
  stopPythonBackend();
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  dialog.showErrorBox('Error', err.message);
});
