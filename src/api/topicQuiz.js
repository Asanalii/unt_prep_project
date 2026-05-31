// src/pages/tests/api/topicQuiz.js
import api from "@/api/api";

export function fetchQuizTopics(subject = "math") {
  return api.get("/topic-quiz/topics", { params: { subject } });
}

export function createTopicQuiz(payload) {
  // payload: { subject, topics: [{ topic, count }] }
  return api.post("/topic-quiz", payload);
}

export function fetchTopicQuizDetail(quizId) {
  return api.get(`/topic-quiz/${quizId}`);
}

export function saveQuizAnswer(payload) {
  // payload: { quiz_id, question_id, selected_answers, time_spent_seconds }
  return api.post("/topic-quiz/answer", payload);
}

export function fetchQuizHint(payload) {
  // payload: { quiz_id, question_id }
  return api.post("/topic-quiz/hint", payload);
}

export function finishTopicQuiz(quizId) {
  return api.post(`/topic-quiz/${quizId}/finish`);
}

export function fetchTopicQuizResult(quizId) {
  return api.get(`/topic-quiz/${quizId}/result`);
}

export function fetchTopicQuizHistory(subject) {
  return api.get("/topic-quiz/history", {
    params: subject ? { subject } : {},
  });
}
