// Format ISO timestamp into local time string
const formatTime = (isoString) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return '';
  }
};

// Render activities list
const updateUI = () => {
  chrome.storage.local.get(['activitiesLog'], (data) => {
    const logs = data.activitiesLog || [];
    
    // 1. Total events count
    document.getElementById('stat-total-events').textContent = logs.length;
    
    // 2. Last action value
    if (logs.length > 0) {
      const lastEvent = logs[logs.length - 1];
      let displayEvent = 'None';
      if (lastEvent.eventType === 'tab_activated') displayEvent = 'Activate';
      else if (lastEvent.eventType === 'url_updated') displayEvent = 'URL';
      else if (lastEvent.eventType === 'tab_closed') displayEvent = 'Close';
      document.getElementById('stat-last-event').textContent = displayEvent;
    } else {
      document.getElementById('stat-last-event').textContent = '-';
    }

    // 3. Render list items in reverse order (newest first)
    const logList = document.getElementById('activity-log-list');
    logList.innerHTML = '';

    if (logs.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-state';
      emptyLi.textContent = 'No activities recorded yet';
      logList.appendChild(emptyLi);
      return;
    }

    const reversedLogs = [...logs].reverse();
    reversedLogs.forEach((item) => {
      const li = document.createElement('li');
      li.className = `log-item event-${item.eventType}`;

      // Try to clean up URL display
      let displayUrl = item.url;
      try {
        if (item.url !== 'unknown') {
          const urlObj = new URL(item.url);
          displayUrl = urlObj.hostname.replace('www.', '') + urlObj.pathname;
        }
      } catch (e) {}

      li.innerHTML = `
        <div class="log-header">
          <span class="log-badge badge-${item.eventType}">${item.eventType.replace('_', ' ')}</span>
          <span class="log-time">${formatTime(item.timestamp)}</span>
        </div>
        <div class="log-url" title="${item.url}">${displayUrl}</div>
        <div class="log-title-text" title="${item.title}">${item.title}</div>
      `;
      logList.appendChild(li);
    });
  });
};

// Clear Logs button event
document.getElementById('clear-logs-btn').addEventListener('click', () => {
  chrome.storage.local.set({ activitiesLog: [] }, () => {
    updateUI();
  });
});

// Toggle Tracking Status UI
const updateTrackingUI = (isEnabled) => {
  const toggle = document.getElementById('tracking-toggle');
  const dot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  if (toggle) toggle.checked = isEnabled;
  if (dot) {
    if (isEnabled) {
      dot.style.backgroundColor = 'var(--success)';
      dot.style.boxShadow = '0 0 8px var(--success)';
      dot.classList.add('pulse');
    } else {
      dot.style.backgroundColor = 'var(--text-muted)';
      dot.style.boxShadow = 'none';
      dot.classList.remove('pulse');
    }
  }
  if (statusText) {
    statusText.textContent = isEnabled ? 'Tracking Active' : 'Tracking Paused';
  }
};

// Initial UI load and subscription to changes
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  // Load and apply tracking state
  chrome.storage.local.get(['trackingEnabled'], (data) => {
    const isEnabled = data.trackingEnabled !== false;
    updateTrackingUI(isEnabled);
  });

  // Tracking toggle event listener
  const toggleBtn = document.getElementById('tracking-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      chrome.storage.local.set({ trackingEnabled: isEnabled }, () => {
        updateTrackingUI(isEnabled);
      });
    });
  }
  
  // Listen for storage changes to update UI in real-time if popup is open
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.activitiesLog) {
      updateUI();
    }
    if (namespace === 'local' && changes.trackingEnabled) {
      updateTrackingUI(changes.trackingEnabled.newValue !== false);
    }
  });
});
