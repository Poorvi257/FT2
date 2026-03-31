const STORAGE_KEY = "ft2_session_token";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredSessionToken() {
  const storage = getStorage();
  return storage?.getItem(STORAGE_KEY) || "";
}

export function setStoredSessionToken(token) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (token) {
    storage.setItem(STORAGE_KEY, token);
  } else {
    storage.removeItem(STORAGE_KEY);
  }
}

export function clearStoredSessionToken() {
  setStoredSessionToken("");
}

