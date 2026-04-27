import { request } from "./client.js";

const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4001";
const KEY = "ecom_session_v1";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export async function login({ username, password }) {
  const data = await request(AUTH_URL, "/login", { method: "POST", body: { username, password } });
  setSession(data);
  return data;
}

export async function me() {
  const session = getSession();
  if (!session?.token) return null;
  const data = await request(AUTH_URL, "/me", { token: session.token });
  return data.user;
}

