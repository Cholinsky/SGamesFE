import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Clock,
  User,
  Gamepad2,
  GripVertical,
  Save,
  Send,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  getScheduleDays,
  getScheduleEntries,
  updateScheduleEntry,
  publishSchedule,
  getActiveEvent,
} from "../../services/scheduleService";

type ScheduleItem = {
  id: string;
  scheduleDayId: string;
  applicationId: string | null;
  entryType: string;
  time: string;
  runner: string;
  game: string;
  category: string;
  duration: string;
  durationMinutes: number;
  platform: string;
  positionOrder: number;
};

type DaySchedule = {
  [key: string]: ScheduleItem[];
};

type DraggedScheduleItem = {
  day: string;
  index: number;
};
const ItemTypes = {
  SCHEDULE_ITEM: "scheduleItem",
};
const EVENT_ID =
  "04337355-98CA-4836-A1C1-5A8F84869F6D";

function getDayKey(dayDate: string) {
  const date =
    new Date(`${dayDate}T00:00:00`);

  const rawDay =
    date.toLocaleDateString("es-MX", {
      weekday: "long",
    });

  return (
    rawDay.charAt(0).toUpperCase() +
    rawDay.slice(1)
  );
}

function formatDuration(minutes: number) {
  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (hours <= 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function normalizeTimeForApi(time: string) {
  if (time.length === 5) {
    return `${time}:00`;
  }

  return time;
}

interface DraggableItemProps {
  item: ScheduleItem;
  day: string;
  index: number;
  moveItem: (
    fromDay: string,
    fromIndex: number,
    toDay: string,
    toIndex: number
  ) => void;
  onEdit: (item: ScheduleItem) => void;
}

function DraggableItem({
  item,
  day,
  index,
  moveItem,
  onEdit,
}: DraggableItemProps) {
  const [{ isDragging }, drag] =
    useDrag({
      type: ItemTypes.SCHEDULE_ITEM,
      item: { day, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

  const [, drop] =
    useDrop({
      accept: ItemTypes.SCHEDULE_ITEM,
      hover: (
        draggedItem: DraggedScheduleItem
      ) => {
        if (
          draggedItem.day !== day ||
          draggedItem.index !== index
        ) {
          moveItem(
            draggedItem.day,
            draggedItem.index,
            day,
            index
          );

          draggedItem.day =
            day;

          draggedItem.index =
            index;
        }
      },
    });

  return (
    <div
      ref={(node) => {
        if (node) {
          drag(drop(node));
        }
      }}
      className={`group rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-all hover:border-cyan-500/50 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="cursor-move pt-1">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />

              <span className="font-mono font-semibold text-cyan-400">
                {item.time}
              </span>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(item)}
              className="opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />

            <span className="text-sm text-white">
              {item.runner}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Gamepad2 className="mt-0.5 h-4 w-4 text-purple-400" />

            <div>
              <p className="text-sm font-medium text-white">
                {item.game}
              </p>

              <p className="text-xs text-gray-400">
                {item.category} • {item.platform}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-gray-600 text-xs text-gray-400"
            >
              {item.duration}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayColumnProps {
  day: string;
  items: ScheduleItem[];
  moveItem: (
    fromDay: string,
    fromIndex: number,
    toDay: string,
    toIndex: number
  ) => void;
  onEdit: (item: ScheduleItem) => void;
}

function DayColumn({
  day,
  items,
  moveItem,
  onEdit,
}: DayColumnProps) {
  const [, drop] =
    useDrop({
      accept: ItemTypes.SCHEDULE_ITEM,
      drop: (
        draggedItem: DraggedScheduleItem
      ) => {
        if (draggedItem.day !== day) {
          moveItem(
            draggedItem.day,
            draggedItem.index,
            day,
            items.length
          );
        }
      },
    });

  return (
    <div
      ref={(node) => {
        if (node) {
          drop(node);
        }
      }}
      className="flex-1"
    >
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {day}
            </h3>

            <Badge
              variant="outline"
              className="border-gray-700 text-gray-400"
            >
              {items.length}{" "}
              {items.length === 1 ? "run" : "runs"}
            </Badge>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-700 p-8 text-center">
                <p className="text-sm text-gray-500">
                  Arrastra runs aquí para agregar al {day}
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  day={day}
                  index={index}
                  moveItem={moveItem}
                  onEdit={onEdit}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminHorarios() {
  const [schedule, setSchedule] =
    useState<DaySchedule>({});
const [activeEventId, setActiveEventId] =
  useState("");
  const [scheduleDayIds, setScheduleDayIds] =
    useState<Record<string, string>>({});

  const [isPublished, setIsPublished] =
    useState(false);

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<ScheduleItem | null>(null);

  const [editTime, setEditTime] =
    useState("");

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    try {

      const activeEvent =
        await getActiveEvent();
        setActiveEventId(activeEvent.id);
        setIsPublished(activeEvent.isPublished);
      const days =
        await getScheduleDays();

      const entries =
        await getScheduleEntries();
      const grouped: DaySchedule =
        {};

      const dayIds: Record<string, string> =
        {};

      days.forEach((day: any) => {
        const key =
          getDayKey(day.dayDate);

        if (!grouped[key]) {
          grouped[key] = [];
        }

        if (!dayIds[key]) {
          dayIds[key] =
            day.id;
        }
      });

      entries.forEach((entry: any) => {
        const key =
          getDayKey(entry.dayDate);

        if (!grouped[key]) {
          grouped[key] = [];
        }

        if (!dayIds[key] && entry.scheduleDayId) {
          dayIds[key] =
            entry.scheduleDayId;
        }

        grouped[key].push({
          id:
            entry.id,

          scheduleDayId:
            entry.scheduleDayId,

          applicationId:
            entry.applicationId ?? null,

          entryType:
            entry.entryType,

          time:
            String(entry.startTime)
              .substring(0, 5),

          runner:
            entry.runnerName ??
            "Bloque",

          game:
            entry.game ??
            entry.entryType,

          category:
            entry.category ??
            entry.entryType,

          duration:
            formatDuration(
              entry.durationMinutes
            ),

          durationMinutes:
            entry.durationMinutes,

          platform:
            entry.platform ?? "-",

          positionOrder:
            entry.positionOrder,
        });
      });

      Object.keys(grouped).forEach((day) => {
        grouped[day].sort(
          (a, b) =>
            a.positionOrder -
            b.positionOrder
        );
      });

      setScheduleDayIds(dayIds);
      setSchedule(grouped);
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cargar el horario"
      );
    }
  }

  const moveItem = (
    fromDay: string,
    fromIndex: number,
    toDay: string,
    toIndex: number
  ) => {
    setSchedule((prev) => {
      const newSchedule: DaySchedule =
        {};

      Object.keys(prev).forEach((day) => {
        newSchedule[day] =
          [...prev[day]];
      });

      const sourceItems =
        [...(newSchedule[fromDay] ?? [])];

      const [movedItem] =
        sourceItems.splice(
          fromIndex,
          1
        );

      if (!movedItem) {
        return prev;
      }

      const targetScheduleDayId =
        scheduleDayIds[toDay] ??
        movedItem.scheduleDayId;

      const updatedItem: ScheduleItem =
        {
          ...movedItem,

          scheduleDayId:
            targetScheduleDayId,
        };

      if (fromDay === toDay) {
        sourceItems.splice(
          toIndex,
          0,
          updatedItem
        );

        newSchedule[fromDay] =
          sourceItems;
      } else {
        const targetItems =
          [...(newSchedule[toDay] ?? [])];

        targetItems.splice(
          toIndex,
          0,
          updatedItem
        );

        newSchedule[fromDay] =
          sourceItems;

        newSchedule[toDay] =
          targetItems;
      }

      return newSchedule;
    });
  };

  const handleEdit = (
    item: ScheduleItem
  ) => {
    setEditingItem(item);
    setEditTime(item.time);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) {
      return;
    }

    setSchedule((prev) => {
      const newSchedule: DaySchedule =
        {};

      Object.keys(prev).forEach((day) => {
        newSchedule[day] =
          prev[day].map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  time: editTime,
                }
              : item
          );
      });

      return newSchedule;
    });

    toast.success(
      "Horario actualizado. Recuerda guardar el borrador."
    );

    setEditDialogOpen(false);
  };

  const handleSaveDraft = async () => {
    try {
      const updates: Promise<any>[] =
        [];

      Object.keys(schedule).forEach((day) => {
        schedule[day].forEach((item, index) => {
          updates.push(
            updateScheduleEntry(
              item.id,
              {
                scheduleDayId:
                  item.scheduleDayId,

                applicationId:
                  item.applicationId,

                entryType:
                  item.entryType,

                startTime:
                  normalizeTimeForApi(
                    item.time
                  ),

                durationMinutes:
                  item.durationMinutes,

                positionOrder:
                  index + 1,
              }
            )
          );
        });
      });

      await Promise.all(updates);

      toast.success(
        "Borrador guardado correctamente"
      );

      await loadSchedule();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar el borrador"
      );
    }
  };

const handlePublish = async () => {
  try {
    await handleSaveDraft();

    if (!activeEventId) {
      toast.error("No hay evento activo");
      return;
    }

    await publishSchedule(activeEventId);

    setIsPublished(true);

    toast.success(
      "Horario publicado con éxito"
    );
  } catch (error) {
    console.error(error);

    toast.error(
      "No se pudo publicar el horario"
    );
  }
};

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Constructor de Horarios
            </h1>

            <p className="text-gray-400">
              Organiza los speedruns arrastrando y soltando
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPublished ? (
              <Badge className="bg-green-500/20 text-green-400">
                Publicado
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400">
                Borrador
              </Badge>
            )}

            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="border-gray-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>

            <Button
              onClick={handlePublish}
              disabled={isPublished}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Publicar Horario
            </Button>
          </div>
        </div>

        {/* Info Card */}
        {!isPublished ? (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-300">
                ⚠️ <strong>MODO BORRADOR:</strong> Este horario aún no es
                visible para el público. Arrastra los bloques de speedrun para
                reorganizarlos o moverlos entre días. Haz clic en el ícono de
                editar para modificar la hora de inicio.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="p-4">
              <p className="text-sm text-green-300">
                ✅ <strong>HORARIO PUBLICADO:</strong> Este horario es visible
                para el público en la página de horarios. Los cambios se
                reflejarán cuando el público consulte el horario.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Schedule Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.keys(schedule).map((day) => (
            <DayColumn
              key={day}
              day={day}
              items={schedule[day] || []}
              moveItem={moveItem}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        >
          <DialogContent className="border-gray-800 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle>
                Editar Horario
              </DialogTitle>
            </DialogHeader>

            {editingItem && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                  <p className="mb-1 text-sm text-gray-400">
                    Runner
                  </p>

                  <p className="font-medium text-white">
                    {editingItem.runner}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                  <p className="mb-1 text-sm text-gray-400">
                    Juego
                  </p>

                  <p className="font-medium text-white">
                    {editingItem.game}
                  </p>

                  <p className="text-sm text-gray-400">
                    {editingItem.category}
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="editTime"
                    className="text-gray-300"
                  >
                    Hora de inicio
                  </Label>

                  <Input
                    id="editTime"
                    type="time"
                    value={editTime}
                    onChange={(e) =>
                      setEditTime(
                        e.target.value
                      )
                    }
                    className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setEditDialogOpen(false)
                }
                className="border-gray-700"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleSaveEdit}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}