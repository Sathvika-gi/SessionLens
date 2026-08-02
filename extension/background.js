// Cache to keep track of tab URLs and titles so we can query them on tab close
const tabCache = new Map();

// Helper to log activity to the background service worker console and backend server
const logActivity = (eventType, url, title) => {
  // Check if tracking is enabled before performing any log operations
  chrome.storage.local.get(['trackingEnabled'], (data) => {
    const isEnabled = data.trackingEnabled !== false;
    if (!isEnabled) {
      console.log('[SessionLens Activity] Tracking disabled. Activity ignored.');
      return;
    }

    const activity = {
      url: url || 'unknown',
      title: title || 'Untitled',
      timestamp: new Date().toISOString(),
      eventType: eventType
    };

    console.log('[SessionLens Activity]', activity);

    // Send activity to Express backend
    fetch('http://localhost:5000/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activity)
    })
    .then(response => {
      if (!response.ok) {
        console.error('Failed to send activity to server:', response.statusText);
      } else {
        console.log('Activity sent to backend successfully');
      }
    })
    .catch(err => {
      console.warn('Error sending activity to backend (backend might be offline):', err.message);
    });
    
    // Also store in local storage to keep history available for popup or debug
    chrome.storage.local.get(['activitiesLog'], (dataLog) => {
      const log = dataLog.activitiesLog || [];
      log.push(activity);
      
      // Cap log at last 100 entries
      if (log.length > 100) {
        log.shift();
      }
      
      chrome.storage.local.set({ activitiesLog: log });
    });
  });
};

// Helper to cache a tab's details
const cacheTabDetails = (tabId, url, title) => {
  if (url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')) {
    tabCache.set(tabId, { url, title });
  }
};

// Detect Tab Activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      return;
    }
    
    // Update cache
    cacheTabDetails(tab.id, tab.url, tab.title);
    
    // Log active event
    logActivity('tab_activated', tab.url, tab.title);
  });
});

// Detect URL Updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only log if the URL has actually been updated
  if (changeInfo.url) {
    // Update cache with the new URL
    cacheTabDetails(tabId, changeInfo.url, tab.title);
    
    logActivity('url_updated', changeInfo.url, tab.title);
  } else if (changeInfo.title) {
    // Just update title cache if only title changed
    const cached = tabCache.get(tabId);
    if (cached) {
      tabCache.set(tabId, { url: cached.url, title: changeInfo.title });
    }
  }
});

// Detect Tab Closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  const cachedTab = tabCache.get(tabId);
  
  if (cachedTab) {
    // Log closed event using cached details
    logActivity('tab_closed', cachedTab.url, cachedTab.title);
    // Remove from cache
    tabCache.delete(tabId);
  } else {
    // Fallback if tab was not in cache
    logActivity('tab_closed', 'unknown', 'unknown');
  }
});

// Seed cache with all currently open tabs on startup/install
const initializeTabCache = () => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      cacheTabDetails(tab.id, tab.url, tab.title);
    });
  });
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('SessionLens Extension initialized in log-only mode.');
  chrome.storage.local.set({ activitiesLog: [], trackingEnabled: true });
  initializeTabCache();
});

// Re-initialize cache on service worker startup
initializeTabCache();

// Helper to update the extension action badge
const updateBadgeState = (isEnabled) => {
  if (isEnabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // success green
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7280' }); // muted gray
  }
};

// Initialize badge state on startup
chrome.storage.local.get(['trackingEnabled'], (data) => {
  const isEnabled = data.trackingEnabled !== false;
  updateBadgeState(isEnabled);
});

// Listen for storage updates in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.trackingEnabled) {
    updateBadgeState(changes.trackingEnabled.newValue !== false);
  }
});
