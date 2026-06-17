import { API_URL } from "../config/api";

function getHeaders() {
  const token = localStorage.getItem("sgames_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getApplications() {
  const response = await fetch(
    `${API_URL}/Applications`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error loading applications");
  }

  return await response.json();
}

export async function getApplicationById(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error loading application"
    );
  }

  return await response.json();
}

export async function approveApplication(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}/approve`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error approving application");
  }
}

export async function rejectApplication(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}/reject`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error rejecting application");
  }

}

export async function createApplication(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Applications`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Error creating application"
    );
  }

  return await response.json();
}