const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = {
  // Users
  async getUsers() {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },
  async getUser(id) {
    const res = await fetch(`${API_URL}/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },
  async createUser(userData) {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create user");
    }
    return res.json();
  },
  async updateUser(id, userData) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },
  async deleteUser(id) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
  },

  // Posts
  async getPosts() {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return res.json();
  },
  async getPost(id) {
    const res = await fetch(`${API_URL}/posts/${id}`);
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  },
  async createPost(postData) {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create post");
    }
    return res.json();
  },
  async updatePost(id, postData) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error("Failed to update post");
    return res.json();
  },
  async deletePost(id) {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete post");
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_URL}/dashboard/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
};

export default api;
