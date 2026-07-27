import { API_URL } from "../config/api";

function getHeaders() {
  const token = localStorage.getItem("sgames_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getPublicHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const responseText =
    await response.text();

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const parsed =
      JSON.parse(responseText);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return parsed.message;
    }

    if (parsed?.title) {
      return parsed.title;
    }

    if (parsed?.errors) {
      const messages =
        Object.values(parsed.errors)
          .flat()
          .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }
  } catch {
    // Si no es JSON, se usa el texto directo del backend.
  }

  return responseText;
}

async function readJsonResponse(
  response: Response
) {
  const responseText =
    await response.text();

  return responseText
    ? JSON.parse(responseText)
    : null;
}

export async function getApplications() {
  const response = await fetch(
    `${API_URL}/Applications`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading applications"
      )
    );
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
      await getErrorMessage(
        response,
        "Error loading application"
      )
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
    throw new Error(
      await getErrorMessage(
        response,
        "Error approving application"
      )
    );
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
    throw new Error(
      await getErrorMessage(
        response,
        "Error rejecting application"
      )
    );
  }
}

export async function createApplication(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Applications`,
    {
      method: "POST",
      headers: getPublicHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error creating application"
      )
    );
  }

  return await readJsonResponse(response);
}

export async function deleteApplication(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Applications/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error deleting application"
      )
    );
  }

  return true;
}

export async function getPublicApprovedApplications() {
  const response =
    await fetch(
      `${API_URL}/Applications/public-approved`
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading approved applications"
      )
    );
  }

  return await response.json();
}