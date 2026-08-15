// Centralized BroadcastChannel for cross-tab authentication communication
let authChannel = null;

export const getAuthChannel = () => {
  if (!authChannel && typeof BroadcastChannel !== 'undefined') {
    try {
      authChannel = new BroadcastChannel('auth_channel');
    } catch (e) {
      // BroadcastChannel not supported in some environments
      console.warn('BroadcastChannel not supported:', e);
    }
  }
  return authChannel;
};

export const closeAuthChannel = () => {
  if (authChannel) {
    authChannel.close();
    authChannel = null;
  }
};

export const broadcastAuthEvent = (type) => {
  const channel = getAuthChannel();
  if (channel) {
    try {
      channel.postMessage({ type });
    } catch (e) {
      console.warn('Failed to broadcast auth event:', e);
    }
  }
};