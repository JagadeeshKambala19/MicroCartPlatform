function getJson(res) {
  return res.text().then((t) => (t ? JSON.parse(t) : null));
}

export async function request(baseUrl, path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;
  const data = await getJson(res);
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function money(n) {
  const num = Number(n ?? 0);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

