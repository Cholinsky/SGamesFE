import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DateTime } from "luxon";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { clearRunnerToken, getRunnerMe } from "../services/runnerAuthService";
import {
  getMyRunnerRuns,
  type RunnerRun,
} from "../services/runnerRunService";
import {
  getMyRunnerApplications,
  getRunnerActiveEvent,
  submitRunnerRuns,
  type RunnerActiveEvent,
  type RunnerApplicationAvailability,
  type RunnerApplicationListItem,
  type RunnerRacePartner,
} from "../services/runnerApplicationService";

type Availability = {
  dayDate: string;
  label: string;
  selected: boolean;
  availableFrom: string;
  availableTo: string;
  isPreferred: boolean;
  notes: string;
};

type RacePartnerForm = {
  runnerName: string;
  email: string;
  discordUser: string;
  country: string;
  videoUrl: string;
};

const MEXICO_TIMEZONE =
  "America/Mexico_City";

const DEFAULT_AVAILABLE_FROM =
  "10:00";

const DEFAULT_AVAILABLE_TO =
  "23:59";

const timezoneOptions = [
  {
    value: "America/Mexico_City",
    label: "México Centro",
  },
  {
    value: "America/Tijuana",
    label: "México Pacífico / Tijuana",
  },
  {
    value: "America/New_York",
    label: "Estados Unidos Este",
  },
  {
    value: "America/Chicago",
    label: "Estados Unidos Centro",
  },
  {
    value: "America/Denver",
    label: "Estados Unidos Montaña",
  },
  {
    value: "America/Los_Angeles",
    label: "Estados Unidos Pacífico",
  },
  {
    value: "America/Bogota",
    label: "Colombia / Perú / Ecuador",
  },
  {
    value: "America/Santiago",
    label: "Chile",
  },
  {
    value: "America/Argentina/Buenos_Aires",
    label: "Argentina",
  },
  {
    value: "Europe/Madrid",
    label: "España",
  },
  {
    value: "Asia/Tokyo",
    label: "Japón",
  },
];

function capitalizeFirst(
  value: string
) {
  return value.length > 0
    ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
    : value;
}

function getIsoDateOnly(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

function formatAvailabilityLabel(
  dayDate: string
) {
  const date =
    DateTime.fromISO(
      dayDate,
      {
        zone: MEXICO_TIMEZONE,
      }
    ).setLocale("es-MX");

  if (!date.isValid) {
    return dayDate;
  }

  return capitalizeFirst(
    date.toFormat(
      "cccc d 'de' LLLL"
    )
  );
}

function createAvailabilityDaysFromEvent(
  activeEvent: RunnerActiveEvent
): Availability[] {
  const startDate =
    getIsoDateOnly(
      activeEvent.startDate
    );

  const endDate =
    getIsoDateOnly(
      activeEvent.endDate
    );

  if (!startDate || !endDate) {
    return [];
  }

  const start =
    DateTime.fromISO(
      startDate,
      {
        zone: MEXICO_TIMEZONE,
      }
    ).startOf("day");

  const end =
    DateTime.fromISO(
      endDate,
      {
        zone: MEXICO_TIMEZONE,
      }
    ).startOf("day");

  if (!start.isValid ||
      !end.isValid ||
      end < start) {
    return [];
  }

  const days: Availability[] = [];

  let current =
    start;

  while (current <= end) {
    const dayDate =
      current.toFormat(
        "yyyy-MM-dd"
      );

    days.push({
      dayDate,
      label:
        formatAvailabilityLabel(
          dayDate
        ),
      selected: false,
      availableFrom:
        DEFAULT_AVAILABLE_FROM,
      availableTo:
        DEFAULT_AVAILABLE_TO,
      isPreferred: false,
      notes: "",
    });

    current =
      current.plus({
        days: 1,
      });
  }

  return days;
}

function toApiTime(
  value: string
) {
  return `${value}:00`;
}

function convertAvailabilityToMexico(
  availability: Availability,
  runnerTimezone: string
): RunnerApplicationAvailability {
  const localStart =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableFrom}:00`,
      {
        zone: runnerTimezone,
      }
    );

  const localEnd =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableTo}:00`,
      {
        zone: runnerTimezone,
      }
    );

  const mexicoStart =
    localStart.setZone(
      MEXICO_TIMEZONE
    );

  const mexicoEnd =
    localEnd.setZone(
      MEXICO_TIMEZONE
    );

  return {
    dayDate:
      mexicoStart.toFormat(
        "yyyy-MM-dd"
      ),

    availableFrom:
      mexicoStart.toFormat(
        "HH:mm:ss"
      ),

    availableToDayDate:
      mexicoEnd.toFormat(
        "yyyy-MM-dd"
      ),

    availableTo:
      mexicoEnd.toFormat(
        "HH:mm:ss"
      ),

    localDayDate:
      availability.dayDate,

    localAvailableFrom:
      toApiTime(
        availability.availableFrom
      ),

    localAvailableTo:
      toApiTime(
        availability.availableTo
      ),

    isPreferred:
      availability.isPreferred,

    notes:
      availability.notes.trim() || null,
  };
}

function formatConvertedAvailability(
  availability: Availability,
  runnerTimezone: string
) {
  const localStart =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableFrom}:00`,
      {
        zone: runnerTimezone,
      }
    );

  const localEnd =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableTo}:00`,
      {
        zone: runnerTimezone,
      }
    );

  if (!localStart.isValid ||
      !localEnd.isValid) {
    return "Horario inválido";
  }

  const mexicoStart =
    localStart.setZone(
      MEXICO_TIMEZONE
    );

  const mexicoEnd =
    localEnd.setZone(
      MEXICO_TIMEZONE
    );

  const sameDay =
    mexicoStart.toFormat(
      "yyyy-MM-dd"
    ) ===
    mexicoEnd.toFormat(
      "yyyy-MM-dd"
    );

  if (sameDay) {
    return `${mexicoStart.setLocale("es-MX").toFormat("cccc d 'de' LLLL")}, ${mexicoStart.toFormat("HH:mm")} - ${mexicoEnd.toFormat("HH:mm")}`;
  }

  return `${mexicoStart.setLocale("es-MX").toFormat("cccc d 'de' LLLL HH:mm")} - ${mexicoEnd.setLocale("es-MX").toFormat("cccc d 'de' LLLL HH:mm")}`;
}

function hasApplicationForRun(
  run: RunnerRun,
  applications: RunnerApplicationListItem[]
) {
  return applications.some((application) =>
    application.runnerRunId === run.id &&
    application.status !== "Rejected"
  );
}

export default function RunnerPostulacionPage() {
  const navigate =
    useNavigate();

  const [activeEvent, setActiveEvent] =
    useState<RunnerActiveEvent | null>(null);

  const [runs, setRuns] =
    useState<RunnerRun[]>([]);

  const [applications, setApplications] =
    useState<RunnerApplicationListItem[]>([]);

  const [selectedRunIds, setSelectedRunIds] =
    useState<string[]>([]);

  const [availabilities, setAvailabilities] =
    useState<Availability[]>([]);

  const [runnerTimezone, setRunnerTimezone] =
    useState(MEXICO_TIMEZONE);

  const [notes, setNotes] =
    useState("");

  const [racePartners, setRacePartners] =
    useState<Record<string, RacePartnerForm>>({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const selectedRuns =
    useMemo(
      () =>
        runs.filter((run) =>
          selectedRunIds.includes(run.id)
        ),
      [
        runs,
        selectedRunIds,
      ]
    );

  const selectedRaceRuns =
    useMemo(
      () =>
        selectedRuns.filter((run) =>
          run.isRace
        ),
      [
        selectedRuns,
      ]
    );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);

      const [
        runner,
        event,
        myRuns,
        myApplications,
      ] =
        await Promise.all([
          getRunnerMe(),
          getRunnerActiveEvent(),
          getMyRunnerRuns(),
          getMyRunnerApplications(),
        ]);

      setRunnerTimezone(
        runner.timezone ||
        MEXICO_TIMEZONE
      );

      setActiveEvent(event);

      setRuns(
        myRuns.filter((run) =>
          run.isActive)
      );

      setApplications(
        myApplications
      );

      if (event) {
        setAvailabilities(
          createAvailabilityDaysFromEvent(
            event
          )
        );
      }
    } catch (error) {
      clearRunnerToken();

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la postulación runner."
      );

      navigate("/runner/login");
    } finally {
      setLoading(false);
    }
  }

  function toggleRun(
    run: RunnerRun
  ) {
    if (hasApplicationForRun(
        run,
        applications)) {
      toast.error(
        "Esta run ya fue postulada para el evento activo."
      );
      return;
    }

    setSelectedRunIds((current) =>
      current.includes(run.id)
        ? current.filter((id) =>
            id !== run.id)
        : [
            ...current,
            run.id,
          ]
    );
  }

  function updateAvailability(
    index: number,
    changes: Partial<Availability>
  ) {
    setAvailabilities((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  function updateRacePartner(
    runnerRunId: string,
    key: keyof RacePartnerForm,
    value: string
  ) {
    setRacePartners((current) => ({
      ...current,
      [runnerRunId]: {
        runnerName:
          current[runnerRunId]?.runnerName ?? "",
        email:
          current[runnerRunId]?.email ?? "",
        discordUser:
          current[runnerRunId]?.discordUser ?? "",
        country:
          current[runnerRunId]?.country ?? "",
        videoUrl:
          current[runnerRunId]?.videoUrl ?? "",
        [key]: value,
      },
    }));
  }

  function buildRacePartnersPayload(): RunnerRacePartner[] {
    return selectedRaceRuns.map((run) => {
      const partner =
        racePartners[run.id];

      return {
        runnerRunId:
          run.id,

        runnerName:
          partner?.runnerName?.trim() ?? "",

        email:
          partner?.email?.trim() ?? "",

        discordUser:
          partner?.discordUser?.trim() || null,

        country:
          partner?.country?.trim() || null,

        videoUrl:
          partner?.videoUrl?.trim() ?? "",
      };
    });
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!activeEvent) {
      toast.error(
        "No hay evento activo."
      );
      return;
    }

    if (!activeEvent.applicationsOpen) {
      toast.error(
        "Las postulaciones están cerradas."
      );
      return;
    }

    if (selectedRunIds.length === 0) {
      toast.error(
        "Selecciona al menos una run."
      );
      return;
    }

    const selectedAvailability =
      availabilities.filter((item) =>
        item.selected);

    if (selectedAvailability.length === 0) {
      toast.error(
        "Selecciona al menos un día disponible."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await submitRunnerRuns({
          runnerRunIds:
            selectedRunIds,

          notes:
            notes.trim() || null,

          aspectRatio:
            "16:9",

          runnerTimezone,

          availabilities:
            selectedAvailability.map((availability) =>
              convertAvailabilityToMexico(
                availability,
                runnerTimezone
              )
            ),

          racePartners:
            buildRacePartnersPayload(),
        });

      toast.success(
        response.message ||
        "Tus runs fueron postuladas."
      );

      setSelectedRunIds([]);
      setNotes("");

      await loadInitialData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la postulación."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070c] px-4 py-16 text-white">
        <p className="text-center text-slate-400">
          Cargando postulación runner...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070c] px-4 py-10 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">
            Postulación runner
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Postular mis runs
          </h1>

          <p className="mt-2 max-w-3xl text-slate-400">
            Selecciona las runs de tu biblioteca y manda la postulación al evento activo.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/runner/runs"
              className="rounded-2xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:border-orange-400"
            >
              Volver a Mis runs
            </Link>

            {activeEvent && (
              <span className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 font-bold text-orange-200">
                {activeEvent.name}
              </span>
            )}
          </div>
        </header>

        {!activeEvent ? (
          <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
            <h2 className="text-2xl font-black">
              No hay evento activo
            </h2>

            <p className="mt-2 text-slate-300">
              Cuando Super Games active un evento podrás postular tus runs desde aquí.
            </p>
          </section>
        ) : !activeEvent.applicationsOpen ? (
          <section className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
            <h2 className="text-2xl font-black">
              Postulaciones cerradas
            </h2>

            <p className="mt-2 text-slate-300">
              El evento activo existe, pero las postulaciones están cerradas.
            </p>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-6 xl:grid-cols-[1fr_.9fr]"
          >
            <section className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
              <h2 className="text-2xl font-black">
                1. Selecciona runs
              </h2>

              {runs.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-xl font-black">
                    No tienes runs guardadas
                  </p>

                  <p className="mt-2 text-slate-400">
                    Primero agrega una run a tu biblioteca.
                  </p>

                  <Link
                    to="/runner/runs"
                    className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black"
                  >
                    Ir a Mis runs
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {runs.map((run) => {
                    const alreadySubmitted =
                      hasApplicationForRun(
                        run,
                        applications
                      );

                    const selected =
                      selectedRunIds.includes(
                        run.id
                      );

                    return (
                      <button
                        key={run.id}
                        type="button"
                        disabled={alreadySubmitted}
                        onClick={() =>
                          toggleRun(run)
                        }
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-orange-400 bg-orange-500/10"
                            : "border-red-500/20 bg-black/45 hover:border-orange-400"
                        } ${
                          alreadySubmitted
                            ? "cursor-not-allowed opacity-45"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">
                                {run.isRace
                                  ? "Race"
                                  : "Individual"}
                              </span>

                              <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                                {run.estimatedTime}
                              </span>

                              {alreadySubmitted && (
                                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">
                                  Ya postulada
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-2xl font-black">
                              {run.gameName}
                            </h3>

                            <p className="mt-1 text-slate-300">
                              {run.categoryName} · {run.platformName}
                            </p>

                            {run.videoUrl && (
                              <p className="mt-2 text-sm text-slate-400">
                                Video demo listo
                              </p>
                            )}
                          </div>

                          <span className="text-sm font-black text-orange-200">
                            {selected
                              ? "Seleccionada"
                              : alreadySubmitted
                                ? "Bloqueada"
                                : "Seleccionar"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedRaceRuns.length > 0 && (
                <div className="mt-8 rounded-3xl border border-orange-500/25 bg-orange-500/10 p-5">
                  <h3 className="text-xl font-black">
                    Datos de race
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Para cada race necesitamos los datos del segundo jugador.
                  </p>

                  <div className="mt-5 space-y-5">
                    {selectedRaceRuns.map((run) => (
                      <div
                        key={run.id}
                        className="rounded-2xl border border-red-500/25 bg-black/50 p-4"
                      >
                        <h4 className="font-black text-orange-200">
                          {run.gameName}
                        </h4>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <input
                            value={racePartners[run.id]?.runnerName ?? ""}
                            onChange={(event) =>
                              updateRacePartner(
                                run.id,
                                "runnerName",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                            placeholder="Nombre del segundo jugador"
                          />

                          <input
                            value={racePartners[run.id]?.email ?? ""}
                            onChange={(event) =>
                              updateRacePartner(
                                run.id,
                                "email",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                            placeholder="Email"
                          />

                          <input
                            value={racePartners[run.id]?.discordUser ?? ""}
                            onChange={(event) =>
                              updateRacePartner(
                                run.id,
                                "discordUser",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                            placeholder="Discord"
                          />

                          <input
                            value={racePartners[run.id]?.country ?? ""}
                            onChange={(event) =>
                              updateRacePartner(
                                run.id,
                                "country",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                            placeholder="País"
                          />

                          <input
                            value={racePartners[run.id]?.videoUrl ?? ""}
                            onChange={(event) =>
                              updateRacePartner(
                                run.id,
                                "videoUrl",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400 md:col-span-2"
                            placeholder="Video demo del segundo jugador"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
                <h2 className="text-2xl font-black">
                  2. Disponibilidad
                </h2>

                <label className="mt-5 block">
                  <span className="text-sm font-bold text-slate-300">
                    Zona horaria
                  </span>

                  <select
                    value={runnerTimezone}
                    onChange={(event) =>
                      setRunnerTimezone(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  >
                    {timezoneOptions.map((timezone) => (
                      <option
                        key={timezone.value}
                        value={timezone.value}
                      >
                        {timezone.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-5 space-y-4">
                  {availabilities.map((availability, index) => (
                    <div
                      key={availability.dayDate}
                      className={`rounded-2xl border p-4 ${
                        availability.selected
                          ? "border-orange-400 bg-orange-500/10"
                          : "border-red-500/20 bg-black/45"
                      }`}
                    >
                      <label className="flex items-center gap-3 font-black">
                        <input
                          type="checkbox"
                          checked={availability.selected}
                          onChange={(event) =>
                            updateAvailability(
                              index,
                              {
                                selected:
                                  event.target.checked,
                              }
                            )
                          }
                        />

                        {availability.label}
                      </label>

                      {availability.selected && (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <input
                            type="time"
                            value={availability.availableFrom}
                            onChange={(event) =>
                              updateAvailability(
                                index,
                                {
                                  availableFrom:
                                    event.target.value,
                                }
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                          />

                          <input
                            type="time"
                            value={availability.availableTo}
                            onChange={(event) =>
                              updateAvailability(
                                index,
                                {
                                  availableTo:
                                    event.target.value,
                                }
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                          />

                          <label className="flex items-center gap-2 text-sm font-bold text-slate-300 md:col-span-2">
                            <input
                              type="checkbox"
                              checked={availability.isPreferred}
                              onChange={(event) =>
                                updateAvailability(
                                  index,
                                  {
                                    isPreferred:
                                      event.target.checked,
                                  }
                                )
                              }
                            />
                            Día preferido
                          </label>

                          <input
                            value={availability.notes}
                            onChange={(event) =>
                              updateAvailability(
                                index,
                                {
                                  notes:
                                    event.target.value,
                                }
                              )
                            }
                            className="rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400 md:col-span-2"
                            placeholder="Notas de disponibilidad"
                          />

                          <p className="rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 text-xs font-bold text-orange-100 md:col-span-2">
                            Convertido a México Centro:{" "}
                            {formatConvertedAvailability(
                              availability,
                              runnerTimezone
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
                <h2 className="text-2xl font-black">
                  3. Notas generales
                </h2>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  className="mt-4 min-h-32 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="Notas opcionales para el staff..."
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Enviando..."
                    : `Postular ${selectedRunIds.length} run(s)`}
                </button>
              </div>
            </section>
          </form>
        )}
      </section>
    </main>
  );
}
