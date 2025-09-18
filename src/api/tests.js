import { mock, get, post } from "../lib/http";

const catalog = [
  { id: "full-001", type: "full", title: "Полный тест #1", duration: 120 },
  {
    id: "math-001",
    type: "subject",
    subject: "math",
    title: "Математика #1",
    duration: 60,
  },
];

mock("GET", "/tests", async ({ query }) => ({
  items: catalog.filter((t) => !query?.type || t.type === query.type),
}));
mock("POST", "/tests/start", async ({ body }) => ({
  attemptId: "A-" + Math.random().toString(36).slice(2, 8),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  questions: [
    {
      id: "q1",
      type: "single",
      body: "2+2=?",
      choices: [
        { id: "a", text: "3" },
        { id: "b", text: "4" },
      ],
    },
    { id: "q2", type: "number", body: "Корень из 9 = ?" },
  ],
}));

export const fetchTests = (type) => get("/tests", { query: { type } });
export const startTest = (payload) => post("/tests/start", { body: payload });
