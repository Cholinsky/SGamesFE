import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { StatusBadge } from "../components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Play,
  Download,
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
            Sistema de Diseño SGames
          </h1>
          <p className="text-gray-400">
            Componentes y estilos para la aplicación SGames
          </p>
        </div>

        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="colors">Colores</TabsTrigger>
            <TabsTrigger value="buttons">Botones</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="states">Estados</TabsTrigger>
            <TabsTrigger value="icons">Iconos</TabsTrigger>
          </TabsList>

          {/* Colors */}
          <TabsContent value="colors">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Paleta de Colores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Colores Primarios
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-cyan-500" />
                      <p className="text-sm text-white">Cyan 500</p>
                      <code className="text-xs text-gray-400">#06b6d4</code>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-purple-600" />
                      <p className="text-sm text-white">Purple 600</p>
                      <code className="text-xs text-gray-400">#9333ea</code>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600" />
                      <p className="text-sm text-white">Gradient</p>
                      <code className="text-xs text-gray-400">
                        cyan-500 → purple-600
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Colores de Estado
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-green-500" />
                      <p className="text-sm text-white">Success</p>
                      <code className="text-xs text-gray-400">#22c55e</code>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-yellow-500" />
                      <p className="text-sm text-white">Warning</p>
                      <code className="text-xs text-gray-400">#eab308</code>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-red-500" />
                      <p className="text-sm text-white">Error</p>
                      <code className="text-xs text-gray-400">#ef4444</code>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-blue-500" />
                      <p className="text-sm text-white">Info</p>
                      <code className="text-xs text-gray-400">#3b82f6</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Escala de Grises
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-5">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gray-950" />
                      <p className="text-sm text-white">Gray 950</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gray-900" />
                      <p className="text-sm text-white">Gray 900</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gray-800" />
                      <p className="text-sm text-white">Gray 800</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gray-700" />
                      <p className="text-sm text-white">Gray 700</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-gray-400" />
                      <p className="text-sm text-white">Gray 400</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buttons */}
          <TabsContent value="buttons">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Botones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Botón Primario
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                      <Play className="mr-2 h-4 w-4" />
                      Botón Primario
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    >
                      Pequeño
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    >
                      Grande
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Botón Secundario
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Botón Secundario
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Pequeño
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Grande
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Botones Ghost
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost" className="text-gray-400">
                      Ghost Normal
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Ghost Cyan
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-green-400 hover:bg-green-500/10"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Ghost Green
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Ghost Red
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Estados de Botón
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600">
                      Normal
                    </Button>
                    <Button
                      disabled
                      className="bg-gradient-to-r from-cyan-500 to-purple-600"
                    >
                      Deshabilitado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inputs */}
          <TabsContent value="inputs">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Campos de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div>
                    <Label htmlFor="input1" className="text-gray-300">
                      Input de Texto
                    </Label>
                    <Input
                      id="input1"
                      placeholder="Escribe algo..."
                      className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="input2" className="text-gray-300">
                      Input con Error
                    </Label>
                    <Input
                      id="input2"
                      placeholder="Campo requerido"
                      className="mt-1.5 border-red-500 bg-gray-800 text-white"
                    />
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      Este campo es requerido
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="select1" className="text-gray-300">
                      Select
                    </Label>
                    <Select>
                      <SelectTrigger
                        id="select1"
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                      >
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-700 bg-gray-800">
                        <SelectItem value="1">Opción 1</SelectItem>
                        <SelectItem value="2">Opción 2</SelectItem>
                        <SelectItem value="3">Opción 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="textarea1" className="text-gray-300">
                      Textarea
                    </Label>
                    <Textarea
                      id="textarea1"
                      placeholder="Escribe un mensaje..."
                      className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="check1" className="border-gray-700" />
                    <Label
                      htmlFor="check1"
                      className="text-sm font-normal text-gray-300"
                    >
                      Checkbox
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="switch1" />
                    <Label
                      htmlFor="switch1"
                      className="text-sm font-normal text-gray-300"
                    >
                      Switch
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Badges y Etiquetas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Badges Básicos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Badges de Estado
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="pending" />
                    <StatusBadge status="approved" />
                    <StatusBadge status="rejected" />
                    <StatusBadge status="published" />
                    <StatusBadge status="draft" />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Badges Personalizados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      Cyan
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      Purple
                    </Badge>
                    <Badge className="bg-pink-500/20 text-pink-400">
                      Pink
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400">
                      Green
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      Yellow
                    </Badge>
                    <Badge className="bg-red-500/20 text-red-400">Red</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards */}
          <TabsContent value="cards">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Card Básico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Este es un card básico con borde oscuro y fondo
                    semi-transparente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/50 bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Card con Acento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Card con borde cyan y sombra para resaltar contenido
                    importante.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
                <CardHeader>
                  <CardTitle className="text-white">Card con Gradiente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">
                    Card con fondo degradado de cyan a purple.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/50 bg-green-500/10">
                <CardHeader>
                  <CardTitle className="text-white">Card de Éxito</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-300">
                    Card para mostrar mensajes de éxito.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* States */}
          <TabsContent value="states">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Estados de la Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Estados de Postulación
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status="pending" />
                      <span className="text-gray-300">
                        Postulación en revisión
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="approved" />
                      <span className="text-gray-300">
                        Postulación aprobada
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="rejected" />
                      <span className="text-gray-300">
                        Postulación rechazada
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Estados de Horario
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <StatusBadge status="draft" />
                      <span className="text-gray-300">
                        Horario en borrador
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="published" />
                      <span className="text-gray-300">Horario publicado</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-cyan-400">
                    Estados de Run
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 text-green-400">
                        En vivo
                      </Badge>
                      <span className="text-gray-300">
                        Run actualmente en curso
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-cyan-500/20 text-cyan-400">
                        Próximo
                      </Badge>
                      <span className="text-gray-300">Siguiente run</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gray-500/20 text-gray-400">
                        Completado
                      </Badge>
                      <span className="text-gray-300">Run finalizado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons */}
          <TabsContent value="icons">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white">Iconos (Lucide)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 md:grid-cols-6 lg:grid-cols-8">
                  <div className="flex flex-col items-center gap-2">
                    <Play className="h-6 w-6 text-cyan-400" />
                    <span className="text-xs text-gray-400">Play</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Download className="h-6 w-6 text-cyan-400" />
                    <span className="text-xs text-gray-400">Download</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-cyan-400" />
                    <span className="text-xs text-gray-400">Upload</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="h-6 w-6 text-cyan-400" />
                    <span className="text-xs text-gray-400">Settings</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <span className="text-xs text-gray-400">Check</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-6 w-6 text-red-400" />
                    <span className="text-xs text-gray-400">X</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                    <span className="text-xs text-gray-400">Alert</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-6 w-6 text-blue-400" />
                    <span className="text-xs text-gray-400">Info</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
