import { API_URL } from "../config/api";

export async function loginRequest(
  email: string,
  password: string
) {
  const response =
    await fetch(
      `${API_URL}/Auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

  if (!response.ok) {
    throw new Error(
      "Login failed"
    );
  }

  return await response.json();
}

export function getHeaders() {
  const token =
    localStorage.getItem("sgames_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}