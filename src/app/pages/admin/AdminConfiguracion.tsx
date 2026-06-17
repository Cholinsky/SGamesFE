import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  Settings,
  Save,
  Calendar,
  Mail,
  Globe,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminConfiguracion() {
  const [eventConfig, setEventConfig] = useState({
    nombre: "SGames 2026",
    descripcion:
      "Un evento dedicado a reunir speedrunners de distintos juegos y plataformas",
    fechaInicio: "2026-07-12",
    fechaFin: "2026-07-14",
    ubicacion: "Online",
    emailContacto: "contacto@sgames.com",
    urlStream: "https://twitch.tv/sgames",
  });

  const [postulacionesConfig, setPostulacionesConfig] = useState({
    abiertas: true,
    fechaLimite: "2026-06-30",
    requiereAprobacion: true,
    maximoPorUsuario: 3,
  });

  const [notificacionesConfig, setNotificacionesConfig] = useState({
    emailNuevaPostulacion: true,
    emailCambioEstado: true,
    emailPublicacionHorario: true,
  });

  const handleSaveEventConfig = () => {
    toast.success("Configuración del evento guardada");
  };

  const handleSavePostulacionesConfig = () => {
    toast.success("Configuración de postulaciones guardada");
  };

  const handleSaveNotificacionesConfig = () => {
    toast.success("Configuración de notificaciones guardada");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400">
          Administra la configuración general del evento
        </p>
      </div>

      {/* Event Configuration */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Configuración del Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nombre" className="text-gray-300">
                Nombre del evento
              </Label>
              <Input
                id="nombre"
                value={eventConfig.nombre}
                onChange={(e) =>
                  setEventConfig({ ...eventConfig, nombre: e.target.value })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="ubicacion" className="text-gray-300">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                value={eventConfig.ubicacion}
                onChange={(e) =>
                  setEventConfig({ ...eventConfig, ubicacion: e.target.value })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={eventConfig.descripcion}
              onChange={(e) =>
                setEventConfig({ ...eventConfig, descripcion: e.target.value })
              }
              className="mt-1.5 min-h-[100px] border-gray-700 bg-gray-800 text-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fechaInicio" className="text-gray-300">
                Fecha de inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                value={eventConfig.fechaInicio}
                onChange={(e) =>
                  setEventConfig({
                    ...eventConfig,
                    fechaInicio: e.target.value,
                  })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="fechaFin" className="text-gray-300">
                Fecha de fin
              </Label>
              <Input
                id="fechaFin"
                type="date"
                value={eventConfig.fechaFin}
                onChange={(e) =>
                  setEventConfig({ ...eventConfig, fechaFin: e.target.value })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="emailContacto" className="text-gray-300">
                <Mail className="mr-1 inline h-4 w-4" />
                Email de contacto
              </Label>
              <Input
                id="emailContacto"
                type="email"
                value={eventConfig.emailContacto}
                onChange={(e) =>
                  setEventConfig({
                    ...eventConfig,
                    emailContacto: e.target.value,
                  })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="urlStream" className="text-gray-300">
                <Globe className="mr-1 inline h-4 w-4" />
                URL del stream
              </Label>
              <Input
                id="urlStream"
                type="url"
                value={eventConfig.urlStream}
                onChange={(e) =>
                  setEventConfig({ ...eventConfig, urlStream: e.target.value })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveEventConfig}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Postulaciones Configuration */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-purple-400" />
            Configuración de Postulaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-base text-white">
                Postulaciones abiertas
              </Label>
              <p className="text-sm text-gray-400">
                Permitir que los usuarios envíen postulaciones
              </p>
            </div>
            <Switch
              checked={postulacionesConfig.abiertas}
              onCheckedChange={(checked) =>
                setPostulacionesConfig({
                  ...postulacionesConfig,
                  abiertas: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-base text-white">
                Requiere aprobación
              </Label>
              <p className="text-sm text-gray-400">
                Las postulaciones deben ser aprobadas por un administrador
              </p>
            </div>
            <Switch
              checked={postulacionesConfig.requiereAprobacion}
              onCheckedChange={(checked) =>
                setPostulacionesConfig({
                  ...postulacionesConfig,
                  requiereAprobacion: checked,
                })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fechaLimite" className="text-gray-300">
                Fecha límite
              </Label>
              <Input
                id="fechaLimite"
                type="date"
                value={postulacionesConfig.fechaLimite}
                onChange={(e) =>
                  setPostulacionesConfig({
                    ...postulacionesConfig,
                    fechaLimite: e.target.value,
                  })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="maximoPorUsuario" className="text-gray-300">
                Máximo por usuario
              </Label>
              <Input
                id="maximoPorUsuario"
                type="number"
                min="1"
                max="10"
                value={postulacionesConfig.maximoPorUsuario}
                onChange={(e) =>
                  setPostulacionesConfig({
                    ...postulacionesConfig,
                    maximoPorUsuario: parseInt(e.target.value),
                  })
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          {!postulacionesConfig.abiertas && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-400">
                  Postulaciones cerradas
                </p>
                <p className="text-sm text-yellow-400/80">
                  Los usuarios no podrán enviar nuevas postulaciones mientras
                  esta opción esté desactivada.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSavePostulacionesConfig}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones Configuration */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-green-400" />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-base text-white">
                Nueva postulación
              </Label>
              <p className="text-sm text-gray-400">
                Recibir email cuando llegue una nueva postulación
              </p>
            </div>
            <Switch
              checked={notificacionesConfig.emailNuevaPostulacion}
              onCheckedChange={(checked) =>
                setNotificacionesConfig({
                  ...notificacionesConfig,
                  emailNuevaPostulacion: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-base text-white">Cambio de estado</Label>
              <p className="text-sm text-gray-400">
                Notificar al runner cuando su postulación cambie de estado
              </p>
            </div>
            <Switch
              checked={notificacionesConfig.emailCambioEstado}
              onCheckedChange={(checked) =>
                setNotificacionesConfig({
                  ...notificacionesConfig,
                  emailCambioEstado: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <div className="space-y-0.5">
              <Label className="text-base text-white">
                Publicación de horario
              </Label>
              <p className="text-sm text-gray-400">
                Notificar cuando se publique el horario oficial
              </p>
            </div>
            <Switch
              checked={notificacionesConfig.emailPublicacionHorario}
              onCheckedChange={(checked) =>
                setNotificacionesConfig({
                  ...notificacionesConfig,
                  emailPublicacionHorario: checked,
                })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotificacionesConfig}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
