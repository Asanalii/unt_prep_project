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

export function createReply(threadId, payload) {
  return api.post(`/forum/threads/${threadId}/replies`, payload);
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
