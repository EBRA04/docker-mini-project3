const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const logsBox = document.getElementById('logs');
const refreshLogsBtn = document.getElementById('refreshLogsBtn');

async function updateLogs() {
  try {
    const logs = await window.sandboxAPI.logs();
    logsBox.value = logs;
  } catch (e) {
    logsBox.value = 'Error reading logs:\n' + e;
  }
}

startBtn.onclick = async () => {
  logsBox.value = 'Starting sandbox...';
  try {
    const out = await window.sandboxAPI.start();
    logsBox.value = 'Sandbox started.\n\n' + out;
    setTimeout(updateLogs, 1500);
  } catch (e) {
    logsBox.value = 'Error starting sandbox:\n' + e;
  }
};

stopBtn.onclick = async () => {
  logsBox.value = 'Stopping sandbox...';
  try {
    const out = await window.sandboxAPI.stop();
    logsBox.value = 'Sandbox stopped.\n\n' + out;
  } catch (e) {
    logsBox.value = 'Error stopping sandbox:\n' + e;
  }
};

resetBtn.onclick = async () => {
  logsBox.value = 'Resetting sandbox (stop + remove + start)...';
  try {
    const out = await window.sandboxAPI.reset();
    logsBox.value = 'Sandbox reset.\n\n' + out;
    setTimeout(updateLogs, 1500);
  } catch (e) {
    logsBox.value = 'Error resetting sandbox:\n' + e;
  }
};

refreshLogsBtn.onclick = updateLogs;

// Load logs once on startup
updateLogs();
