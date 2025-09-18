// Примитивный мок: карта endpoint -> handler({method, body, query})
const routes = new Map();

// helper: регистрируем мок-эндпоинты
export function mock(method, path, handler) {
  routes.set(method + " " + path, handler);
}

// клиент
export async function http(method, path, { body, query } = {}) {
  const key = method + " " + path;
  const handler = routes.get(key);
  // имитация сети
  await new Promise((r) => setTimeout(r, 250));
  if (!handler) return { status: 404, data: { message: "Not found" } };
  const data = await handler({ body, query });
  return { status: 200, data };
}

// sugar
export const get = (p, o) => http("GET", p, o);
export const post = (p, o) => http("POST", p, o);
