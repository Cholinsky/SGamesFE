import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertTriangle,
  CalendarDays,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  hidePost,
  showPost,
  updatePost,
} from "../../services/postService";

type PostListItem = {
  id: string;
  title: string;
  category: string;
  author: string;
  isVisible: boolean;
  createdAt: string;
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  category: string;
  isVisible: boolean;
  publishDate: string | null;
  expireDate: string | null;
  author: string;
  createdAt: string;
};

type PostFormState = {
  title: string;
  content: string;
  category: string;
  isVisible: string;
  publishDate: string;
  expireDate: string;
};

const emptyForm: PostFormState = {
  title: "",
  content: "",
  category: "anuncio",
  isVisible: "visible",
  publishDate: "",
  expireDate: "",
};

const categories = [
  {
    value: "anuncio",
    label: "Anuncio",
    className: "bg-cyan-500/20 text-cyan-300",
  },
  {
    value: "noticia",
    label: "Noticia",
    className: "bg-purple-500/20 text-purple-300",
  },
  {
    value: "actualizacion",
    label: "Actualización",
    className: "bg-green-500/20 text-green-300",
  },
  {
    value: "importante",
    label: "Importante",
    className: "bg-pink-500/20 text-pink-300",
  },
];

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryLabel(value: string) {
  if (value === "actualización") {
    return "Actualización";
  }

  return (
    categories.find((category) => category.value === value)?.label ??
    value
  );
}

function getCategoryClass(value: string) {
  if (value === "actualización") {
    return "bg-green-500/20 text-green-300";
  }

  return (
    categories.find((category) => category.value === value)?.className ??
    "bg-gray-500/20 text-gray-300"
  );
}

function toDateInputValue(dateValue?: string | null) {
  if (!dateValue) {
    return "";
  }

  return dateValue.split("T")[0];
}

export default function AdminPublicaciones() {
  const [posts, setPosts] =
    useState<PostListItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("todos");

  const [visibilityFilter, setVisibilityFilter] =
    useState("todos");

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingPostId, setEditingPostId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<PostFormState>(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [postToDelete, setPostToDelete] =
    useState<PostListItem | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);

      const data =
        await getPosts();

      setPosts(data);
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudieron cargar las publicaciones"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts =
    useMemo(() => {
      return posts.filter((post) => {
        const normalizedSearch =
          searchTerm.toLowerCase();

        const matchesSearch =
          post.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          post.author
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesCategory =
          categoryFilter === "todos" ||
          post.category === categoryFilter;

        const matchesVisibility =
          visibilityFilter === "todos" ||
          (
            visibilityFilter === "visible" &&
            post.isVisible
          ) ||
          (
            visibilityFilter === "oculta" &&
            !post.isVisible
          );

        return (
          matchesSearch &&
          matchesCategory &&
          matchesVisibility
        );
      });
    }, [
      posts,
      searchTerm,
      categoryFilter,
      visibilityFilter,
    ]);

  const totalPosts =
    posts.length;

  const visiblePosts =
    posts.filter((post) => post.isVisible).length;

  const hiddenPosts =
    posts.filter((post) => !post.isVisible).length;

  function updateFormField(
    field: keyof PostFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateDialog() {
    setEditingPostId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function openEditDialog(postId: string) {
    try {
      const detail: PostDetail =
        await getPostById(postId);

      setEditingPostId(detail.id);

      setForm({
        title: detail.title,
        content: detail.content,
        category:
          detail.category === "actualización"
            ? "actualizacion"
            : detail.category,
        isVisible: detail.isVisible
          ? "visible"
          : "oculta",
        publishDate: toDateInputValue(
          detail.publishDate
        ),
        expireDate: toDateInputValue(
          detail.expireDate
        ),
      });

      setDialogOpen(true);
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cargar la publicación"
      );
    }
  }

  async function handleSavePost() {
    if (!form.title.trim()) {
      toast.error("Escribe un título");
      return;
    }

    if (!form.content.trim()) {
      toast.error("Escribe el contenido");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Selecciona una categoría");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        isVisible: form.isVisible === "visible",
        publishDate: form.publishDate || null,
        expireDate: form.expireDate || null,
      };

      if (editingPostId) {
        await updatePost(editingPostId, payload);

        toast.success(
          "Publicación actualizada"
        );
      } else {
        await createPost(payload);

        toast.success(
          "Publicación creada"
        );
      }

      setDialogOpen(false);
      setEditingPostId(null);
      setForm(emptyForm);

      await loadPosts();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar la publicación"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVisibility(
    post: PostListItem
  ) {
    try {
      if (post.isVisible) {
        await hidePost(post.id);

        toast.success(
          "Publicación ocultada"
        );
      } else {
        await showPost(post.id);

        toast.success(
          "Publicación visible"
        );
      }

      await loadPosts();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cambiar la visibilidad"
      );
    }
  }

  function openDeleteDialog(post: PostListItem) {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!postToDelete) {
      return;
    }

    try {
      await deletePost(postToDelete.id);

      toast.success(
        "Publicación eliminada"
      );

      setDeleteDialogOpen(false);
      setPostToDelete(null);

      await loadPosts();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo eliminar la publicación"
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Publicaciones
          </h1>

          <p className="text-gray-400">
            Gestiona anuncios, noticias y actualizaciones reales del evento
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={loadPosts}
            className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>

          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Publicación
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Total publicaciones
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {totalPosts}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Visibles
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {visiblePosts}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Ocultas
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {hiddenPosts}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500 to-slate-700">
              <EyeOff className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="grid gap-3 p-6 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            <Input
              placeholder="Buscar por título o autor..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="border-gray-700 bg-gray-800 pl-10 text-white"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>

            <SelectContent className="border-gray-700 bg-gray-800">
              <SelectItem value="todos">
                Todas las categorías
              </SelectItem>

              {categories.map((category) => (
                <SelectItem
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={visibilityFilter}
            onValueChange={setVisibilityFilter}
          >
            <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>

            <SelectContent className="border-gray-700 bg-gray-800">
              <SelectItem value="todos">
                Todos los estados
              </SelectItem>

              <SelectItem value="visible">
                Visible
              </SelectItem>

              <SelectItem value="oculta">
                Oculta
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">
                    Título
                  </TableHead>

                  <TableHead className="text-gray-400">
                    Categoría
                  </TableHead>

                  <TableHead className="text-gray-400">
                    Autor
                  </TableHead>

                  <TableHead className="text-gray-400">
                    Fecha
                  </TableHead>

                  <TableHead className="text-gray-400">
                    Estado
                  </TableHead>

                  <TableHead className="text-right text-gray-400">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-gray-400"
                    >
                      Cargando publicaciones...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
                    >
                      No hay publicaciones para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow
                      key={post.id}
                      className="border-gray-800 hover:bg-gray-800/50"
                    >
                      <TableCell className="font-semibold text-white">
                        {post.title}
                      </TableCell>

                      <TableCell>
                        <Badge className={getCategoryClass(post.category)}>
                          {getCategoryLabel(post.category)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(post.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell>
                        {post.isVisible ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            Visible
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400">
                            Oculta
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleVisibility(post)
                            }
                            className="text-cyan-400 hover:bg-cyan-500/10"
                            title={
                              post.isVisible
                                ? "Ocultar"
                                : "Mostrar"
                            }
                          >
                            {post.isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              openEditDialog(post.id)
                            }
                            className="text-purple-400 hover:bg-purple-500/10"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              openDeleteDialog(post)
                            }
                            className="text-red-400 hover:bg-red-500/10"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden border-gray-800 bg-gray-900 p-0 text-white">
          <DialogHeader className="border-b border-gray-800 px-6 py-4">
            <DialogTitle>
              {editingPostId
                ? "Editar publicación"
                : "Nueva publicación"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Label>
                Título
              </Label>

              <Input
                value={form.title}
                onChange={(event) =>
                  updateFormField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Ej. Postulaciones abiertas"
                className="border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Categoría
              </Label>

              <Select
                value={form.category}
                onValueChange={(value) =>
                  updateFormField(
                    "category",
                    value
                  )
                }
              >
                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>

                <SelectContent className="border-gray-700 bg-gray-800">
                  {categories.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Contenido
              </Label>

              <Textarea
                value={form.content}
                onChange={(event) =>
                  updateFormField(
                    "content",
                    event.target.value
                  )
                }
                placeholder="Escribe el anuncio, noticia o actualización..."
                className="min-h-40 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Fecha de publicación
                </Label>

                <Input
                  type="date"
                  value={form.publishDate}
                  onChange={(event) =>
                    updateFormField(
                      "publishDate",
                      event.target.value
                    )
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Fecha de expiración
                </Label>

                <Input
                  type="date"
                  value={form.expireDate}
                  onChange={(event) =>
                    updateFormField(
                      "expireDate",
                      event.target.value
                    )
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Estado
              </Label>

              <Select
                value={form.isVisible}
                onValueChange={(value) =>
                  updateFormField(
                    "isVisible",
                    value
                  )
                }
              >
                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>

                <SelectContent className="border-gray-700 bg-gray-800">
                  <SelectItem value="visible">
                    Visible
                  </SelectItem>

                  <SelectItem value="oculta">
                    Oculta
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-800 px-6 py-4">
            <Button
              variant="outline"
              onClick={() =>
                setDialogOpen(false)
              }
              className="border-gray-700"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSavePost}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white"
            >
              {saving
                ? "Guardando..."
                : "Guardar publicación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent className="border-gray-800 bg-gray-900 text-white">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>

              <AlertDialogTitle>
                Eliminar publicación
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="text-gray-400">
              {postToDelete ? (
                <>
                  Vas a eliminar{" "}
                  <span className="font-semibold text-white">
                    {postToDelete.title}
                  </span>
                  . Esta acción no se puede deshacer.
                </>
              ) : (
                "Esta acción eliminará la publicación."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
