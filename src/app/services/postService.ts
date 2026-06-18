import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getPosts() {
  const response =
    await fetch(
      `${API_URL}/Posts`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading posts"
    );
  }

  return await response.json();
}

export async function getPostById(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Posts/${id}`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading post"
    );
  }

  return await response.json();
}

export async function createPost(
  data: any
) {
  const response =
    await fetch(
      `${API_URL}/Posts`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error creating post"
    );
  }

  return await response.json();
}

export async function updatePost(
  id: string,
  data: any
) {
  const response =
    await fetch(
      `${API_URL}/Posts/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error updating post"
    );
  }

  return await response.json();
}

export async function showPost(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Posts/${id}/show`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error showing post"
    );
  }

  return await response.json();
}

export async function hidePost(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Posts/${id}/hide`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error hiding post"
    );
  }

  return await response.json();
}

export async function deletePost(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Posts/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error deleting post"
    );
  }

  return await response.json();
}

