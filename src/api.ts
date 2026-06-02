import { clearSession, loadSession, saveSession, type Session } from "./session";

// Expo 는 process.env.EXPO_PUBLIC_* 를 직접 참조할 때만 빌드시 값을 주입한다(별칭 우회 X).
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

let currentSession: Session | null = null;

export type Profile = {
  id: string;
  name: string;
  handle: string;
  email: string;
  bio: string;
  currentStreak: number;
  bestStreak: number;
  totalChecks: number;
  trophies: number;
};

export type Pod = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  certifiedToday: number;
  maxMembers: number;
  streak: number;
  tagLine: string;
  tags: string[];
  needsCheckIn: boolean;
  inviteCode?: string;
};

export type CheckIn = {
  id: string;
  podId: string;
  authorId: string;
  author: string;
  meta: string;
  text: string;
  mediaUrl?: string | null;
  likes: number;
  likedByMe: boolean;
  checks: number;
  checkedByMe: boolean;
  comments: number;
  mine: boolean;
};

export type CheckInComment = {
  id: string;
  checkInId: string;
  authorId: string;
  author: string;
  text: string;
  meta: string;
  mine: boolean;
};

export type PodMember = {
  id: string;
  name: string;
  handle: string;
  streak: number;
  checkedInToday: boolean;
  role: string;
};

export type Stats = {
  currentStreak: number;
  bestStreak: number;
  weeklyChecks: number;
  weeklyGoal: number;
  totalChecks: number;
  activePods: number;
  monthlyCompletionRate: number;
  checkedDaysInMonth: number;
  month: number;
  year: number;
  heatmap: number[];
  recentTrophy?: string | null;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  meta: string;
  type: string;
  urgent: boolean;
  read: boolean;
};

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

export function setApiSession(session: Session | null) {
  currentSession = session;
}

export function getApiSession() {
  return currentSession;
}

export async function restoreApiSession() {
  currentSession = await loadSession();
  return currentSession;
}

export async function login(email: string, password: string) {
  const auth = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true
  });
  const session = toSession(auth);
  setApiSession(session);
  await saveSession(session);
  return session;
}

export async function signUp(email: string, password: string, name: string, handle: string) {
  const auth = await request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name, handle }),
    skipAuth: true
  });
  const session = toSession(auth);
  setApiSession(session);
  await saveSession(session);
  return session;
}

export async function kakaoLogin(tokens: { accessToken: string; refreshToken?: string; expiresAt?: number }) {
  const session: Session = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt
  };
  setApiSession(session);
  await saveSession(session);
  return session;
}

export async function logout() {
  try {
    await request<void>("/api/auth/logout", {
      method: "POST",
      retryOnUnauthorized: false
    });
  } catch {
    // 로그아웃은 서버 세션 정리에 실패해도 로컬 세션과 화면 상태를 반드시 비운다.
  }
  finally {
    setApiSession(null);
    await clearSession();
  }
}

export const fetchProfile = () => request<Profile>("/api/profile/me");
export const fetchPods = () => request<Pod[]>("/api/pods");
export const fetchStats = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year != null) {
    params.set("year", String(year));
  }
  if (month != null) {
    params.set("month", String(month));
  }
  const query = params.toString();
  return request<Stats>(`/api/stats/me${query ? `?${query}` : ""}`);
};
export const fetchNotifications = (type?: string) =>
  request<AppNotification[]>(`/api/notifications${type ? `?type=${encodeURIComponent(type)}` : ""}`);
export const markNotificationsRead = () =>
  request<AppNotification[]>("/api/notifications/read-all", { method: "PATCH" });
export const fetchPodFeed = (podId: string) =>
  request<CheckIn[]>(`/api/pods/${encodeURIComponent(podId)}/feed`);
export const fetchPodMembers = (podId: string) =>
  request<PodMember[]>(`/api/pods/${encodeURIComponent(podId)}/members`);
export const reactToCheckIn = (checkInId: string) =>
  request<CheckIn>(`/api/check-ins/${encodeURIComponent(checkInId)}/checks`, { method: "POST" });
export const likeCheckIn = (checkInId: string) =>
  request<CheckIn>(`/api/check-ins/${encodeURIComponent(checkInId)}/likes`, { method: "POST" });
export const fetchComments = (checkInId: string) =>
  request<CheckInComment[]>(`/api/check-ins/${encodeURIComponent(checkInId)}/comments`);
export const addComment = (checkInId: string, text: string) =>
  request<CheckInComment>(`/api/check-ins/${encodeURIComponent(checkInId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ text })
  });
export const createCheckIn = (podId: string, text: string, mediaUrl?: string | null) =>
  request<CheckIn>(`/api/pods/${encodeURIComponent(podId)}/check-ins`, {
    method: "POST",
    body: JSON.stringify({ text, mediaUrl })
  });
export const updateCheckIn = (checkInId: string, text: string) =>
  request<CheckIn>(`/api/check-ins/${encodeURIComponent(checkInId)}`, {
    method: "PATCH",
    body: JSON.stringify({ text })
  });
export const deleteCheckIn = (checkInId: string) =>
  request<void>(`/api/check-ins/${encodeURIComponent(checkInId)}`, { method: "DELETE" });
export const createPod = (pod: {
  name: string;
  description: string;
  maxMembers: number;
  tagLine: string;
  tags: string[];
}) =>
  request<Pod>("/api/pods", {
    method: "POST",
    body: JSON.stringify(pod)
  });
export const previewJoin = (inviteCode: string) =>
  request<Pod>(`/api/pods/join-preview?inviteCode=${encodeURIComponent(inviteCode)}`);
export const joinPod = (inviteCode: string) =>
  request<Pod>("/api/pods/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode })
  });
export const updateProfile = (profile: Pick<Profile, "name" | "handle" | "bio">) =>
  request<Profile>("/api/profile/me", {
    method: "PATCH",
    body: JSON.stringify(profile)
  });
export const inviteMember = (podId: string, handle: string) =>
  request<{ podId: string; handle: string; status: string; inviteLink: string }>(
    `/api/pods/${encodeURIComponent(podId)}/invites`,
    {
      method: "POST",
      body: JSON.stringify({ handle })
    }
  );
export const leavePod = (podId: string) =>
  request<void>(`/api/pods/${encodeURIComponent(podId)}/members/me`, { method: "DELETE" });

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(currentSession && !options.skipAuth ? { Authorization: `Bearer ${currentSession.accessToken}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 401 && options.retryOnUnauthorized !== false && currentSession?.refreshToken) {
    const refreshed = await refreshSession(currentSession.refreshToken);
    if (refreshed) {
      return request<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  if (!response.ok) {
    const errorBody = await readError(response);
    throw new Error(errorBody || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function refreshSession(refreshToken: string) {
  try {
    const auth = await request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
      retryOnUnauthorized: false
    });
    const session = toSession(auth);
    setApiSession(session);
    await saveSession(session);
    return session;
  } catch {
    setApiSession(null);
    await clearSession();
    return null;
  }
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string };
    return body.message ?? body.error;
  } catch {
    return response.statusText;
  }
}

function toSession(auth: AuthResponse): Session {
  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    expiresAt: auth.expires_at
  };
}
