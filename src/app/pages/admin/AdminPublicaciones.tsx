import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

type Publicacion = {
  id: string;
  titulo: string;
  contenido: string;
  autor: string;
  fecha: string;
  visible: boolean;
  categoria: "anuncio" | "noticia" | "actualización";
};

const mockPublicaciones: Publicacion[] = [
  {
    id: "1",
    titulo: "¡Postulaciones abiertas para SGames 2026!",
    contenido:
      "Estamos emocionados de anunciar que las postulaciones para SGames 2026 ya están abiertas. Los speedrunners pueden enviar sus propuestas hasta el 30 de junio.",
    autor: "Admin Principal",
    fecha: "2026-06-01",
    visible: true,
    categoria: "anuncio",
  },
  {
    id: "2",
    titulo: "Nuevas categorías añadidas al evento",
    contenido:
      "Hemos añadido nuevas categorías para incluir más variedad de speedruns, incluyendo runs cooperativos y carreras.",
    autor: "Admin Principal",
    fecha: "2026-05-28",
    visible: true,
    categoria: "noticia",
  },
  {
    id: "3",
    titulo: "Actualización del sistema de postulaciones",
    contenido:
      "El formulario de postulaciones ha sido actualizado para incluir más opciones de plataformas y formatos de video.",
    autor: "Admin Técnico",
    fecha: "2026-05-25",
    visible: false,
    categoria: "actualización",
  },
];

export default function AdminPublicaciones() {
  const [publicaciones, setPublicaciones] =
    useState<Publicacion[]>(mockPublicaciones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublicacion, setEditingPublicacion] =
    useState<Publicacion | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    categoria: "anuncio" as "anuncio" | "noticia" | "actualización",
  });

  const handleCreate = () => {
    setEditingPublicacion(null);
    setFormData({ titulo: "", contenido: "", categoria: "anuncio" });
    setDialogOpen(true);
  };

  const handleEdit = (publicacion: Publicacion) => {
    setEditingPublicacion(publicacion);
    setFormData({
      titulo: publicacion.titulo,
      contenido: publicacion.contenido,
      categoria: publicacion.categoria,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPublicacion) {
      setPublicaciones(
        publicaciones.map((p) =>
          p.id === editingPublicacion.id
            ? {
                ...p,
                titulo: formData.titulo,
                contenido: formData.contenido,
                categoria: formData.categoria,
              }
            : p
        )
      );
      toast.success("Publicación actualizada");
    } else {
      const newPublicacion: Publicacion = {
        id: crypto.randomUUID(),
        titulo: formData.titulo,
        contenido: formData.contenido,
        autor: "Admin Principal",
        fecha: new Date().toISOString().split("T")[0],
        visible: true,
        categoria: formData.categoria,
      };
      setPublicaciones([newPublicacion, ...publicaciones]);
      toast.success("Publicación creada");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPublicaciones(publicaciones.filter((p) => p.id !== id));
    toast.success("Publicación eliminada");
  };

  const handleToggleVisibility = (id: string) => {
    setPublicaciones(
      publicaciones.map((p) =>
        p.id === id ? { ...p, visible: !p.visible } : p
      )
    );
    toast.success("Visibilidad actualizada");
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "anuncio":
        return "bg-cyan-500/20 text-cyan-400";
      case "noticia":
        return "bg-purple-500/20 text-purple-400";
      case "actualización":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Publicaciones</h1>
          <p className="text-gray-400">
            Gestiona anuncios, noticias y actualizaciones del evento
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Publicación
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Publicaciones</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {publicaciones.length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Visibles</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {publicaciones.filter((p) => p.visible).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ocultas</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {publicaciones.filter((p) => !p.visible).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                <EyeOff className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Título</TableHead>
                  <TableHead className="text-gray-400">Categoría</TableHead>
                  <TableHead className="text-gray-400">Autor</TableHead>
                  <TableHead className="text-gray-400">Fecha</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-right text-gray-400">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicaciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No hay publicaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  publicaciones.map((publicacion) => (
                    <TableRow
                      key={publicacion.id}
                      className="border-gray-800 hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-white">
                        {publicacion.titulo}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getCategoriaColor(publicacion.categoria)}
                        >
                          {publicacion.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {publicacion.autor}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(publicacion.fecha).toLocaleDateString(
                          "es-ES"
                        )}
                      </TableCell>
                      <TableCell>
                        {publicacion.visible ? (
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
                              handleToggleVisibility(publicacion.id)
                            }
                            className="text-cyan-400 hover:bg-cyan-500/10"
                          >
                            {publicacion.visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(publicacion)}
                            className="text-purple-400 hover:bg-purple-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(publicacion.id)}
                            className="text-red-400 hover:bg-red-500/10"
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-gray-800 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingPublicacion
                ? "Editar Publicación"
                : "Nueva Publicación"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo" className="text-gray-300">
                Título
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="Título de la publicación"
              />
            </div>

            <div>
              <Label htmlFor="categoria" className="text-gray-300">
                Categoría
              </Label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria: e.target.value as
                      | "anuncio"
                      | "noticia"
                      | "actualización",
                  })
                }
                className="mt-1.5 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              >
                <option value="anuncio">Anuncio</option>
                <option value="noticia">Noticia</option>
                <option value="actualización">Actualización</option>
              </select>
            </div>

            <div>
              <Label htmlFor="contenido" className="text-gray-300">
                Contenido
              </Label>
              <Textarea
                id="contenido"
                value={formData.contenido}
                onChange={(e) =>
                  setFormData({ ...formData, contenido: e.target.value })
                }
                className="mt-1.5 min-h-[200px] border-gray-700 bg-gray-800 text-white"
                placeholder="Contenido de la publicación..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.titulo || !formData.contenido}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {editingPublicacion ? "Guardar Cambios" : "Crear Publicación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
