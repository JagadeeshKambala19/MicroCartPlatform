import { request } from "./client.js";

const CART_URL = import.meta.env.VITE_CART_URL || "http://localhost:4003";

export async function getCart() {
  const data = await request(CART_URL, "/cart");
  return data.items;
}

export async function addToCart(productId, quantity = 1) {
  const data = await request(CART_URL, "/cart/items", { method: "POST", body: { productId, quantity } });
  return data.item;
}

export async function updateCartItem(id, quantity) {
  const data = await request(CART_URL, `/cart/items/${id}`, { method: "PATCH", body: { quantity } });
  return data?.item ?? null;
}

export async function removeCartItem(id) {
  await request(CART_URL, `/cart/items/${id}`, { method: "DELETE" });
}

export async function clearCart() {
  await request(CART_URL, "/cart/clear", { method: "DELETE" });
}

