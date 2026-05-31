// src/api/forum.js
import api from "@/api/api";

export function fetchThreads(params = {}) {
  return api.get("/forum/threads", { params });
}

export function fetchThreadById(id) {
  return api.get(`/forum/threads/${id}`);
}

export function createThread(payload) {
  return api.post("/forum/threads", payload);
}

export async function uploadForumFiles(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await api.post("/forum/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export function createReply(threadId, payload) {
  // payload: { body, parent_reply_id? }
  return api.post(`/forum/threads/${threadId}/replies`, payload);
}

export function acceptReply(threadId, replyId) {
  return api.post(`/forum/threads/${threadId}/replies/${replyId}/accept`);
}
