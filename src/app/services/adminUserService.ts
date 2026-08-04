import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type AdminUser = {
  id: string;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  isCurrentUser: boolean;
};

export type AdminRole = {
  id: number;
  name: string;
};

export type CreateAdminUserPayload = {
  username: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
};

export type UpdateAdminUserPayload = {
  username: string;
  email: string;
  roleId: number;
  isActive: boolean;
};

async function parseResponseError(
  response: Response,
  defaultMessage: string
) {
  const error =
    await response.text();

  return error || defaultMessage;
}

export async function getAdminUsers() {
  const response =
    await fetch(
      `${API_URL}/AdminUsers`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudieron cargar los administradores"
      )
    );
  }

  return await response.json() as AdminUser[];
}

export async function getAdminRoles() {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/roles`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudieron cargar los roles"
      )
    );
  }

  return await response.json() as AdminRole[];
}

export async function createAdminUser(
  payload: CreateAdminUserPayload
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo crear el administrador"
      )
    );
  }

  return await response.json();
}

export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo actualizar el administrador"
      )
    );
  }

  return await response.json();
}

export async function updateAdminUserPassword(
  id: string,
  newPassword: string
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/${id}/password`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          newPassword,
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo actualizar la contraseña"
      )
    );
  }

  return await response.json();
}

export async function activateAdminUser(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/${id}/activate`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo activar el administrador"
      )
    );
  }

  return await response.json();
}

export async function deactivateAdminUser(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/${id}/deactivate`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo desactivar el administrador"
      )
    );
  }

  return await response.json();
}

export async function deleteAdminUser(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/AdminUsers/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await parseResponseError(
        response,
        "No se pudo eliminar el administrador"
      )
    );
  }

  return await response.json();
}