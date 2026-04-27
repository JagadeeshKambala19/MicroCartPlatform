import { request } from "./client.js";

const ORDER_URL = import.meta.env.VITE_ORDER_URL || "http://localhost:4004";

export async function placeOrder(userId) {
  const data = await request(ORDER_URL, "/orders", { method: "POST", body: { userId } });
  return data;
}

export async function listOrders(userId) {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const data = await request(ORDER_URL, `/orders${qs}`);
  return data;
}

