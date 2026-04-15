const http = require("http");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PORT = 3333;
const ROOT = __dirname;

// Track running processes
const running = new Map();
let idCounter = 0;

function runCommand(cmd, args, res) {
  const id = ++idCounter;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  send("start", { id, cmd: `${cmd} ${args.join(" ")}` });

  const proc = spawn(cmd, args, {
    cwd: ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "0" },
  });

  running.set(id, proc);

  proc.stdout.on("data", (chunk) => send("stdout", chunk.toString()));
  proc.stderr.on("data", (chunk) => send("stderr", chunk.toString()));

  proc.on("close", (code) => {
    running.delete(id);
    send("done", { code });
    res.end();
  });

  proc.on("error", (err) => {
    running.delete(id);
    send("error", err.message);
    res.end();
  });

  res.on("close", () => {
    if (running.has(id)) {
      proc.kill();
      running.delete(id);
    }
  });
}

// Scan for journey folders
function getJourneyFolders() {
  const dir = path.join(ROOT, "images", "journeys");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "_optimized")
    .map((d) => d.name);
}

// Count source images per folder
function getImageCounts() {
  const base = path.join(ROOT, "images", "journeys");
  const optBase = path.join(base, "_optimized");
  const folders = getJourneyFolders();
  const exts = [".jpg", ".jpeg", ".png", ".webp", ".tiff"];
  return folders.map((f) => {
    const srcDir = path.join(base, f);
    const optDir = path.join(optBase, f);
    const srcCount = fs.existsSync(srcDir)
      ? fs.readdirSync(srcDir).filter((n) => exts.includes(path.extname(n).toLowerCase())).length
      : 0;
    const optCount = fs.existsSync(optDir) ? fs.readdirSync(optDir).length : 0;
    return { folder: f, sources: srcCount, optimized: optCount };
  });
}

// Check git status
function getGitInfo() {
  return new Promise((resolve) => {
    const proc = spawn("git", ["status", "--porcelain"], { cwd: ROOT, shell: true });
    let out = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.on("close", () => resolve(out.trim()));
  });
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Itsy Bitsy Toolkit</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #0a0a0a;
    color: #e0e0e0;
    min-height: 100vh;
  }

  header {
    background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
    border-bottom: 1px solid #c9a96233;
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  header h1 {
    font-size: 22px;
    font-weight: 600;
    color: #c9a962;
  }

  header h1 span {
    color: #888;
    font-weight: 400;
    font-size: 16px;
    margin-left: 8px;
  }

  .status-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade8066;
  }

  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  .section {
    background: #141414;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .section h2 {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #c9a962;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section h2 .icon { font-size: 18px; }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 14px 16px;
    text-align: center;
  }

  .stat-card .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
    margin-bottom: 6px;
  }

  .stat-card .value {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
  }

  .stat-card .sub {
    font-size: 11px;
    color: #666;
    margin-top: 2px;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  button {
    background: #1e1e1e;
    color: #e0e0e0;
    border: 1px solid #333;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button:hover {
    background: #2a2a2a;
    border-color: #c9a962;
    color: #fff;
  }

  button.primary {
    background: #c9a962;
    color: #0a0a0a;
    border-color: #c9a962;
    font-weight: 600;
  }

  button.primary:hover {
    background: #d4b872;
  }

  button.danger {
    border-color: #ef4444;
    color: #ef4444;
  }

  button.danger:hover {
    background: #ef44441a;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  button .spinner {
    width: 14px; height: 14px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: none;
  }

  button.running .spinner { display: inline-block; }
  button.running { opacity: 0.7; }

  @keyframes spin { to { transform: rotate(360deg); } }

  .console {
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 8px;
    margin-top: 16px;
    display: none;
    max-height: 400px;
    overflow: hidden;
    flex-direction: column;
  }

  .console.visible { display: flex; }

  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 14px;
    background: #111;
    border-bottom: 1px solid #222;
    font-size: 12px;
    color: #888;
  }

  .console-header .clear-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 8px;
  }

  .console-header .clear-btn:hover { color: #aaa; }

  .console-body {
    padding: 14px;
    font-family: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12.5px;
    line-height: 1.6;
    overflow-y: auto;
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .console-body .stdout { color: #d4d4d4; }
  .console-body .stderr { color: #f59e0b; }
  .console-body .error { color: #ef4444; }
  .console-body .info { color: #c9a962; }
  .console-body .success { color: #4ade80; }

  .git-files {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 12px;
    max-height: 200px;
    overflow-y: auto;
    line-height: 1.8;
  }

  .git-files .added { color: #4ade80; }
  .git-files .modified { color: #f59e0b; }
  .git-files .untracked { color: #ef4444; }
  .git-files .empty { color: #555; font-style: italic; }

  .commit-input {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .commit-input input {
    flex: 1;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 10px 14px;
    color: #e0e0e0;
    font-size: 14px;
    outline: none;
  }

  .commit-input input:focus {
    border-color: #c9a962;
  }

  .commit-input input::placeholder { color: #555; }

  .refresh-btn {
    background: none;
    border: none;
    color: #c9a962;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    transition: transform 0.2s;
  }

  .refresh-btn:hover { transform: rotate(90deg); }
</style>
</head>
<body>

<header>
  <div class="status-dot"></div>
  <h1>Itsy Bitsy Toolkit <span>Content Management</span></h1>
</header>

<main>

  <!-- IMAGE OPTIMIZATION -->
  <div class="section">
    <h2><span class="icon">&#x1f5bc;</span> Image Optimization</h2>
    <div class="stats" id="image-stats"></div>
    <div class="actions">
      <button class="primary" onclick="runAction(this, 'optimize')">
        <span class="spinner"></span> Optimize New Images
      </button>
      <button onclick="runAction(this, 'optimize-force')">
        <span class="spinner"></span> Rebuild All Images
      </button>
      <button onclick="runAction(this, 'install')">
        <span class="spinner"></span> Install Dependencies
      </button>
    </div>
    <div class="console" id="console-images">
      <div class="console-header">
        <span>Output</span>
        <button class="clear-btn" onclick="clearConsole('console-images')">Clear</button>
      </div>
      <div class="console-body"></div>
    </div>
  </div>

  <!-- GIT & DEPLOY -->
  <div class="section">
    <h2>
      <span class="icon">&#x1f680;</span> Deploy
      <button class="refresh-btn" onclick="refreshGit()" title="Refresh">&#x21bb;</button>
    </h2>
    <div class="git-files" id="git-status">
      <span class="empty">Loading...</span>
    </div>
    <div class="commit-input">
      <input type="text" id="commit-msg" placeholder="Commit message (e.g. Add new Hawaii photos)">
    </div>
    <div class="actions">
      <button onclick="runAction(this, 'git-status')">
        <span class="spinner"></span> Refresh Status
      </button>
      <button onclick="runAction(this, 'git-add')">
        <span class="spinner"></span> Stage All Changes
      </button>
      <button class="primary" onclick="runAction(this, 'git-commit')" id="btn-commit">
        <span class="spinner"></span> Commit
      </button>
      <button class="danger" onclick="runAction(this, 'git-push')" id="btn-push">
        <span class="spinner"></span> Push to GitHub
      </button>
    </div>
    <div class="console" id="console-deploy">
      <div class="console-header">
        <span>Output</span>
        <button class="clear-btn" onclick="clearConsole('console-deploy')">Clear</button>
      </div>
      <div class="console-body"></div>
    </div>
  </div>

  <!-- PREVIEW -->
  <div class="section">
    <h2><span class="icon">&#x1f310;</span> Preview</h2>
    <div class="actions">
      <button class="primary" onclick="runAction(this, 'serve')">
        <span class="spinner"></span> Start Local Server
      </button>
      <button onclick="window.open('http://localhost:8080', '_blank')">
        Open in Browser
      </button>
    </div>
    <div class="console" id="console-preview">
      <div class="console-header">
        <span>Output</span>
        <button class="clear-btn" onclick="clearConsole('console-preview')">Clear</button>
      </div>
      <div class="console-body"></div>
    </div>
  </div>

</main>

<script>
  const ACTIONS = {
    'optimize':       { cmd: 'optimize',      console: 'console-images' },
    'optimize-force': { cmd: 'optimize-force', console: 'console-images' },
    'install':        { cmd: 'install',        console: 'console-images' },
    'git-status':     { cmd: 'git-status',     console: 'console-deploy' },
    'git-add':        { cmd: 'git-add',        console: 'console-deploy' },
    'git-commit':     { cmd: 'git-commit',     console: 'console-deploy' },
    'git-push':       { cmd: 'git-push',       console: 'console-deploy' },
    'serve':          { cmd: 'serve',          console: 'console-preview' },
  };

  function clearConsole(id) {
    const el = document.getElementById(id);
    el.querySelector('.console-body').innerHTML = '';
  }

  function appendToConsole(id, text, cls) {
    const el = document.getElementById(id);
    el.classList.add('visible');
    const body = el.querySelector('.console-body');
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    body.appendChild(span);
    body.scrollTop = body.scrollHeight;
  }

  function runAction(btn, action) {
    const config = ACTIONS[action];
    if (!config) return;

    let url = '/run/' + config.cmd;
    if (action === 'git-commit') {
      const msg = document.getElementById('commit-msg').value.trim();
      if (!msg) {
        appendToConsole(config.console, 'Please enter a commit message first.\\n', 'error');
        document.getElementById('commit-msg').focus();
        return;
      }
      url += '?msg=' + encodeURIComponent(msg);
    }

    btn.classList.add('running');
    btn.disabled = true;
    appendToConsole(config.console, '> Running ' + action + '...\\n', 'info');

    const es = new EventSource(url);

    es.addEventListener('stdout', (e) => {
      appendToConsole(config.console, JSON.parse(e.data), 'stdout');
    });

    es.addEventListener('stderr', (e) => {
      appendToConsole(config.console, JSON.parse(e.data), 'stderr');
    });

    es.addEventListener('error', (e) => {
      if (e.data) appendToConsole(config.console, JSON.parse(e.data) + '\\n', 'error');
    });

    es.addEventListener('done', (e) => {
      const { code } = JSON.parse(e.data);
      if (code === 0) {
        appendToConsole(config.console, '\\nDone!\\n\\n', 'success');
      } else {
        appendToConsole(config.console, '\\nExited with code ' + code + '\\n\\n', 'error');
      }
      es.close();
      btn.classList.remove('running');
      btn.disabled = false;
      loadStats();
      if (action.startsWith('git')) refreshGit();
    });

    es.onerror = () => {
      es.close();
      btn.classList.remove('running');
      btn.disabled = false;
    };
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      const el = document.getElementById('image-stats');
      el.innerHTML = data.map(s =>
        '<div class="stat-card">' +
          '<div class="label">' + s.folder + '</div>' +
          '<div class="value">' + s.sources + '</div>' +
          '<div class="sub">' + s.optimized + ' optimized files</div>' +
        '</div>'
      ).join('');
    } catch (e) {}
  }

  async function refreshGit() {
    try {
      const res = await fetch('/api/git');
      const text = await res.text();
      const el = document.getElementById('git-status');
      if (!text) {
        el.innerHTML = '<span class="empty">Working tree clean — nothing to commit</span>';
        return;
      }
      el.innerHTML = text.split('\\n').map(line => {
        const code = line.substring(0, 2);
        let cls = 'modified';
        if (code.includes('?')) cls = 'untracked';
        else if (code.includes('A')) cls = 'added';
        return '<div class="' + cls + '">' + escHtml(line) + '</div>';
      }).join('');
    } catch (e) {
      document.getElementById('git-status').innerHTML =
        '<span class="empty">Could not load git status</span>';
    }
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  loadStats();
  refreshGit();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(HTML);
    return;
  }

  if (url.pathname === "/api/stats") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(getImageCounts()));
    return;
  }

  if (url.pathname === "/api/git") {
    getGitInfo().then((info) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(info);
    });
    return;
  }

  // Command routes
  if (url.pathname.startsWith("/run/")) {
    const cmd = url.pathname.slice(5);

    switch (cmd) {
      case "install":
        runCommand("npm", ["install"], res);
        break;
      case "optimize":
        runCommand("node", ["build-images.mjs"], res);
        break;
      case "optimize-force":
        runCommand("node", ["build-images.mjs", "--force"], res);
        break;
      case "git-status":
        runCommand("git", ["status"], res);
        break;
      case "git-add":
        runCommand("git", ["add", "-A"], res);
        break;
      case "git-commit": {
        const msg = url.searchParams.get("msg") || "Update content";
        runCommand("git", ["commit", "-m", msg], res);
        break;
      }
      case "git-push":
        runCommand("git", ["push"], res);
        break;
      case "serve":
        runCommand("npx", ["serve", ".", "-l", "8080", "--no-clipboard"], res);
        break;
      default:
        res.writeHead(404);
        res.end("Unknown command");
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  Itsy Bitsy Toolkit running at: ${url}\n`);

  // Auto-open in browser
  const openCmd =
    process.platform === "win32"
      ? "start"
      : process.platform === "darwin"
      ? "open"
      : "xdg-open";
  spawn(openCmd, [url], { shell: true, detached: true, stdio: "ignore" });
});
