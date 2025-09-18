import { mock, get } from "../lib/http";

const threads = [
  {
    id: 1,
    subject: "math",
    title: "Как решать логарифмы?",
    author: "Ayan_KZ",
    views: 12,
    replies: 3,
    createdAt: "2d",
  },
  {
    id: 2,
    subject: "history",
    title: "Почему 1817?",
    author: "Aigefim_22",
    views: 14,
    replies: 2,
    createdAt: "3d",
  },
  {
    id: 3,
    subject: "lang",
    title: "Как улучшить чтение на казахском?",
    author: "Tilµt_s",
    views: 16,
    replies: 4,
    createdAt: "5d",
  },
];

mock("GET", "/forum/threads", async () => ({ items: threads }));

export const fetchThreads = () => get("/forum/threads");
