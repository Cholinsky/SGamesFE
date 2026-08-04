import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ShieldCheck,
  UserPlus,
  Edit,
  Trash2,
  KeyRound,
  Search,
  RefreshCw,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  activateAdminUser,
  createAdminUser,
  deactivateAdminUser,
  deleteAdminUser,
  getAdminRoles,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserPassword,
  type AdminRole,
  type AdminUser,
} from "../../services/adminUserService";
import { useAdminSeasonTheme } from "../../hooks/useAdminSeasonTheme";

type AdminUserFormState = {
  username: string;
  email: string;
  password: string;
  roleId: string;
  isActive: boolean;
};

const emptyForm: AdminUserFormState = {
  username: "",
  email: "",
  password: "",
  roleId: "",
  isActive: true,
};

function formatDate(
  value: string
) {
  return new Date(value)
    .toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
}

function getRoleLabel(
  roleName: string
) {
  switch (roleName) {
    case "Admin":
      return "Administrador";

    case "Reviewer":
      return "Revisor";

    default:
      return roleName;
  }
}

export default function AdminAdministradores() {
  useAdminSeasonTheme();

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [roles, setRoles] =
    useState<AdminRole[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  const [form, setForm] =
    useState<AdminUserFormState>(
      emptyForm
    );

  const [passwordDialogOpen, setPasswordDialogOpen] =
    useState(false);

  const [passwordUser, setPasswordUser] =
    useState<AdminUser | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        userData,
        roleData,
      ] = await Promise.all([
        getAdminUsers(),
        getAdminRoles(),
      ]);

      setUsers(
        Array.isArray(userData)
          ? userData
          : []
      );

      setRoles(
        Array.isArray(roleData)
          ? roleData
          : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el módulo de administradores"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers =
    useMemo(() => {
      const term =
        searchTerm.trim().toLowerCase();

      if (!term) {
        return users;
      }

      return users.filter((user) =>
        [
          user.username,
          user.email,
          user.roleName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }, [
      users,
      searchTerm,
    ]);

  const activeUsers =
    users.filter((user) => user.isActive).length;

  const adminUsers =
    users.filter((user) => user.roleName === "Admin").length;

  function updateForm(
    field: keyof AdminUserFormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateDialog() {
    setEditingUser(null);

    setForm({
      ...emptyForm,
      roleId:
        String(
          roles.find((role) => role.name === "Reviewer")?.id ??
          roles[0]?.id ??
          ""
        ),
    });

    setDialogOpen(true);
  }

  function openEditDialog(
    user: AdminUser
  ) {
    setEditingUser(user);

    setForm({
      username: user.username,
      email: user.email,
      password: "",
      roleId: String(user.roleId),
      isActive: user.isActive,
    });

    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.username.trim()) {
      toast.error(
        "Escribe el nombre de usuario"
      );
      return;
    }

    if (!form.email.trim()) {
      toast.error(
        "Escribe el correo"
      );
      return;
    }

    if (!form.roleId) {
      toast.error(
        "Selecciona un rol"
      );
      return;
    }

    if (
      !editingUser &&
      form.password.trim().length < 8
    ) {
      toast.error(
        "La contraseña debe tener al menos 8 caracteres"
      );
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        await updateAdminUser(
          editingUser.id,
          {
            username:
              form.username.trim(),
            email:
              form.email.trim(),
            roleId:
              Number(form.roleId),
            isActive:
              form.isActive,
          }
        );

        toast.success(
          "Administrador actualizado correctamente"
        );
      } else {
        await createAdminUser({
          username:
            form.username.trim(),
          email:
            form.email.trim(),
          password:
            form.password,
          roleId:
            Number(form.roleId),
          isActive:
            form.isActive,
        });

        toast.success(
          "Administrador creado correctamente"
        );
      }

      setDialogOpen(false);
      setEditingUser(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el administrador"
      );
    } finally {
      setSaving(false);
    }
  }

  function openPasswordDialog(
    user: AdminUser
  ) {
    setPasswordUser(user);
    setNewPassword("");
    setPasswordDialogOpen(true);
  }

  async function handleSavePassword() {
    if (!passwordUser) {
      return;
    }

    if (newPassword.trim().length < 8) {
      toast.error(
        "La contraseña debe tener al menos 8 caracteres"
      );
      return;
    }

    try {
      setSaving(true);

      await updateAdminUserPassword(
        passwordUser.id,
        newPassword
      );

      toast.success(
        "Contraseña actualizada correctamente"
      );

      setPasswordDialogOpen(false);
      setPasswordUser(null);
      setNewPassword("");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contraseña"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    user: AdminUser
  ) {
    try {
      setSaving(true);

      if (user.isActive) {
        await deactivateAdminUser(
          user.id
        );

        toast.success(
          "Administrador desactivado"
        );
      } else {
        await activateAdminUser(
          user.id
        );

        toast.success(
          "Administrador activado"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    user: AdminUser
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar a ${user.username}? Esta acción no se puede deshacer.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await deleteAdminUser(
        user.id
      );

      toast.success(
        "Administrador eliminado correctamente"
      );

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el administrador"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-[var(--sg-muted-text)]">
        Cargando administradores...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--sg-text)]">
            Administradores
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            Gestiona usuarios con acceso al panel de administración.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            className="border-[var(--sg-border)] text-[var(--sg-primary)] hover:bg-[color-mix(in_srgb,var(--sg-primary)_9%,transparent)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>

          <Button
            onClick={openCreateDialog}
            className="bg-[linear-gradient(90deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo administrador
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="sgames-admin-card">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Total usuarios
              </p>

              <p className="mt-2 text-3xl font-bold text-[var(--sg-text)]">
                {users.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--sg-primary)_14%,transparent)] text-[var(--sg-primary)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="sgames-admin-card">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Activos
              </p>

              <p className="mt-2 text-3xl font-bold text-green-400">
                {activeUsers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <Power className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="sgames-admin-card">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Rol Admin
              </p>

              <p className="mt-2 text-3xl font-bold text-[var(--sg-accent)]">
                {adminUsers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--sg-accent)_12%,transparent)] text-[var(--sg-accent)]">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="sgames-admin-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sg-muted-text)]" />

            <Input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Buscar por nombre, correo o rol..."
              className="sgames-admin-input pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="sgames-admin-card">
        <CardHeader>
          <CardTitle className="text-[var(--sg-text)]">
            Usuarios administrativos
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--sg-border)] text-[var(--sg-muted-text)]">
                <th className="px-3 py-3 font-medium">
                  Usuario
                </th>

                <th className="px-3 py-3 font-medium">
                  Rol
                </th>

                <th className="px-3 py-3 font-medium">
                  Estado
                </th>

                <th className="px-3 py-3 font-medium">
                  Creado
                </th>

                <th className="px-3 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[color-mix(in_srgb,var(--sg-border)_65%,transparent)] text-[var(--sg-text)]"
                >
                  <td className="px-3 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {user.username}
                        </p>

                        {user.isCurrentUser && (
                          <Badge className="bg-[color-mix(in_srgb,var(--sg-primary)_14%,transparent)] text-[var(--sg-primary)]">
                            Tú
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-[var(--sg-muted-text)]">
                        {user.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <Badge className={
                      user.roleName === "Admin"
                        ? "bg-red-500/15 text-red-300"
                        : "bg-[color-mix(in_srgb,var(--sg-primary)_14%,transparent)] text-[var(--sg-primary)]"
                    }>
                      {getRoleLabel(user.roleName)}
                    </Badge>
                  </td>

                  <td className="px-3 py-4">
                    <Badge className={
                      user.isActive
                        ? "bg-green-500/15 text-green-300"
                        : "bg-gray-500/15 text-gray-300"
                    }>
                      {user.isActive
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>
                  </td>

                  <td className="px-3 py-4 text-[var(--sg-muted-text)]">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openEditDialog(user)
                        }
                        className="text-[var(--sg-primary)] hover:bg-[color-mix(in_srgb,var(--sg-primary)_9%,transparent)]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openPasswordDialog(user)
                        }
                        className="text-[var(--sg-secondary)] hover:bg-[color-mix(in_srgb,var(--sg-secondary)_9%,transparent)]"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={
                          user.isCurrentUser ||
                          saving
                        }
                        onClick={() =>
                          handleToggleActive(user)
                        }
                        className={
                          user.isActive
                            ? "text-yellow-300 hover:bg-yellow-500/10"
                            : "text-green-300 hover:bg-green-500/10"
                        }
                      >
                        {user.isActive
                          ? <PowerOff className="h-4 w-4" />
                          : <Power className="h-4 w-4" />}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={
                          user.isCurrentUser ||
                          saving
                        }
                        onClick={() =>
                          handleDelete(user)
                        }
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-10 text-center text-[var(--sg-muted-text)]"
                  >
                    No hay administradores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sgames-admin-dialog max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[var(--sg-text)]">
              {editingUser
                ? "Editar administrador"
                : "Nuevo administrador"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Nombre de usuario
              </Label>

              <Input
                value={form.username}
                onChange={(event) =>
                  updateForm(
                    "username",
                    event.target.value
                  )
                }
                className="sgames-admin-input mt-1.5"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Correo
              </Label>

              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateForm(
                    "email",
                    event.target.value
                  )
                }
                className="sgames-admin-input mt-1.5"
              />
            </div>

            {!editingUser && (
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Contraseña inicial
                </Label>

                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm(
                      "password",
                      event.target.value
                    )
                  }
                  className="sgames-admin-input mt-1.5"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Rol
              </Label>

              <Select
                value={form.roleId}
                onValueChange={(value) =>
                  updateForm(
                    "roleId",
                    value
                  )
                }
              >
                <SelectTrigger className="sgames-admin-input mt-1.5">
                  <SelectValue placeholder="Selecciona rol" />
                </SelectTrigger>

                <SelectContent className="sgames-admin-dialog">
                  {roles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={String(role.id)}
                    >
                      {getRoleLabel(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--sg-border)] p-3 text-[var(--sg-muted-text)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateForm(
                    "isActive",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Usuario activo
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialogOpen(false)
              }
              className="border-[var(--sg-border)] text-[var(--sg-muted-text)]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[linear-gradient(90deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] text-white"
            >
              {saving
                ? "Guardando..."
                : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password dialog */}
      <Dialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      >
        <DialogContent className="sgames-admin-dialog max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--sg-text)]">
              Cambiar contraseña
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-[var(--sg-muted-text)]">
              Usuario:{" "}
              <span className="font-semibold text-[var(--sg-text)]">
                {passwordUser?.username}
              </span>
            </p>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Nueva contraseña
              </Label>

              <Input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                className="sgames-admin-input mt-1.5"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setPasswordDialogOpen(false)
              }
              className="border-[var(--sg-border)] text-[var(--sg-muted-text)]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSavePassword}
              disabled={saving}
              className="bg-[linear-gradient(90deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] text-white"
            >
              Actualizar contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}