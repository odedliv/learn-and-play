# Test Runner Scripts Guide

## Quick Start

Two test runner scripts are available:

### 1. `test.bash` (Recommended)
Full-featured script with Chrome detection and fallbacks.

```bash
./test.bash
```

**Features:**
- Auto-detects Chrome location on Windows
- Falls back to default browser if Chrome not found
- Shows server status and logs
- Graceful shutdown with Ctrl+C

### 2. `test_simple.bash` (Minimal)
Simpler script using Windows `start` command.

```bash
./test_simple.bash
```

**Features:**
- Uses Windows `start chrome` command
- Minimal output
- Quick and simple

## How It Works

Both scripts:
1. **Schedule Chrome to open** in 2 seconds (runs in background)
2. **Start Python HTTP server** on port 8000 (runs in foreground)
3. **Chrome opens automatically** to the test page
4. **Press Ctrl+C** to stop the server

## The Scheduling Trick

The key insight is using bash's `&` operator to run a subshell in the background:

```bash
# This runs in background and doesn't block
(sleep 2 && open_chrome_command) &

# This runs in foreground and blocks (what we want)
python -m http.server 8000
```

## Manual Testing

If scripts don't work, run manually:

**Terminal 1:**
```bash
python -m http.server 8000
```

**Terminal 2 (or browser):**
Open: http://localhost:8000/tests/test-runner.html

## Troubleshooting

### Chrome doesn't open
- Check if Chrome is installed
- Try the simple version: `./test_simple.bash`
- Open browser manually to http://localhost:8000/tests/test-runner.html

### Port 8000 already in use
- Kill existing process: `pkill -f "python.*http.server"`
- Or use different port: Edit script to use 8001, 8002, etc.

### Permission denied
```bash
chmod +x test.bash test_simple.bash
```

## Test Results

When Chrome opens, you should see:
- **6 test suites**
- **19 test cases**
- All tests should pass ✅

Click "Run All Tests" to execute the test suite.
