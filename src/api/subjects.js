import { mock, get } from "../lib/http";

// моковые данные
const subjects = [
  { id: "math", name: "Математика", available: true },
  { id: "cs", name: "Информатика", available: true },
  { id: "history", name: "История", available: false },
  { id: "bio", name: "Биология", available: false },
  { id: "chem", name: "Химия", available: false },
  { id: "kaz", name: "Казахский язык", available: false },
];

// регистрация маршрута
mock("GET", "/subjects", async () => ({ items: subjects }));

export const fetchSubjects = () => get("/subjects");
