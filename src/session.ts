import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "mystreak.session";
let memorySession: string | null = null;

const browserStorage = globalThis as unknown as {
  localStorage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

export type Session = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

export async function loadSession() {
  const rawSession = await getStoredSession();
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function saveSession(session: Session) {
  await setStoredSession(JSON.stringify(session));
}

export async function clearSession() {
  await removeStoredSession();
}

async function getStoredSession() {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return browserStorage.localStorage?.getItem(SESSION_KEY) ?? memorySession;
  }
}

async function setStoredSession(value: string) {
  memorySession = value;
  try {
    await AsyncStorage.setItem(SESSION_KEY, value);
    return;
  } catch {
    browserStorage.localStorage?.setItem(SESSION_KEY, value);
  }
}

async function removeStoredSession() {
  memorySession = null;
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  } catch {
    browserStorage.localStorage?.removeItem(SESSION_KEY);
  }
}
