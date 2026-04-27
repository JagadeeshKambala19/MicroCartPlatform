import { request } from "./client.js";

const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL || "http://localhost:4002";

export async function listProducts() {
  const data = await request(PRODUCT_URL, "/products");
  return data.products;
}

export async function createProduct(payload) {
  const data = await request(PRODUCT_URL, "/products", { method: "POST", body: payload });
  return data.product;
}

export async function updateProduct(id, payload) {
  const data = await request(PRODUCT_URL, `/products/${id}`, { method: "PUT", body: payload });
  return data.product;
}

export async function deleteProduct(id) {
  await request(PRODUCT_URL, `/products/${id}`, { method: "DELETE" });
}

