import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { clearRunnerToken } from "../services/runnerAuthService";
import {
  createRunnerRun,
  deleteRunnerRun,
  getMyRunnerRuns,
  type RunnerRun,
  type RunnerRunPayload,
  updateRunnerRun,
} from "../services/runnerRunService";

const emptyForm = {
  gameName: "",
  categoryName: "",
  platformName: "",
  estimatedTime: "",
  gameReleaseYear: "",
  runType: "Individual",
  isRace: false,
  maxPlayers: 1,
  videoUrl: "",
  description: "",
  isActive: true,
};

export default function RunnerRunsPage() {
  const navigate =
    useNavigate();

  const [runs, setRuns] =
    useState<RunnerRun[]>([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const activeRuns =
    useMemo(
      () =>
        runs.filter((run) => run.isActive),
      [
        runs,
      ]
    );

  useEffect(() => {
    loadRuns();
  }, []);

  async function loadRuns() {
    try {
      setLoading(true);

      const data =
        await getMyRunnerRuns();

      setRuns(data);
    } catch (error) {
      clearRunnerToken();

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar tus runs."
      );

      navigate("/runner/login");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof typeof form>(
    key: K,
    value: typeof form[K]
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "isRace") {
        next.runType =
          value
            ? "Race"
            : "Individual";

        next.maxPlayers =
          value
            ? Math.max(2, Number(current.maxPlayers) || 2)
            : 1;
      }

      return next;
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function buildPayload(): RunnerRunPayload {
    return {
      gameName:
        form.gameName.trim(),

      categoryName:
        form.categoryName.trim(),

      platformName:
        form.platformName.trim(),

      estimatedTime:
        form.estimatedTime.trim(),

      gameReleaseYear:
  form.gameReleaseYear
    ? Number(form.gameReleaseYear)
    : null,

      runType:
        form.isRace
          ? "Race"
          : form.runType.trim() || "Individual",

      isRace:
        form.isRace,

      maxPlayers:
        form.isRace
          ? Math.max(2, Number(form.maxPlayers) || 2)
          : 1,

      videoUrl:
        form.videoUrl.trim() || null,

      description:
        form.description.trim() || null,

      isActive:
        form.isActive,
    };
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      const payload =
        buildPayload();

      if (editingId) {
        const updated =
          await updateRunnerRun(
            editingId,
            payload
          );

        setRuns((current) =>
          current.map((run) =>
            run.id === updated.id
              ? updated
              : run
          )
        );

        toast.success(
          "Run actualizada."
        );
      } else {
        const created =
          await createRunnerRun(
            payload
          );

        setRuns((current) => [
          created,
          ...current,
        ]);

        toast.success(
          "Run guardada en tu biblioteca."
        );
      }

      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la run."
      );
    } finally {
      setSaving(false);
    }
  }

  function editRun(
    run: RunnerRun
  ) {
    setEditingId(run.id);

    setForm({
      gameName: run.gameName,
      categoryName: run.categoryName,
      platformName: run.platformName,
      estimatedTime: run.estimatedTime,
      gameReleaseYear:
  run.gameReleaseYear?.toString() ?? "",
      runType: run.runType,
      isRace: run.isRace,
      maxPlayers: run.maxPlayers,
      videoUrl: run.videoUrl ?? "",
      description: run.description ?? "",
      isActive: run.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function removeRun(
    run: RunnerRun
  ) {
    const confirmed =
      window.confirm(
        `¿Eliminar "${run.gameName}" de tu biblioteca?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRunnerRun(run.id);

      setRuns((current) =>
        current.filter((item) =>
          item.id !== run.id)
      );

      toast.success(
        "Run eliminada."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la run."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070c] px-4 py-16 text-white">
        <p className="text-center text-slate-400">
          Cargando tus runs...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070c] px-4 py-10 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-red-500/25 bg-slate-950/80 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-400">
              Biblioteca runner
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Mis runs
            </h1>

            <p className="mt-2 max-w-3xl text-slate-400">
              Guarda tus juegos, categorías, plataformas, estimados y videos para postularlos más rápido al evento activo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/runner/postular"
              className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 font-black text-black transition hover:scale-[1.01]"
            >
              Postular runs
            </Link>

            <Link
              to="/runner/perfil"
              className="rounded-2xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:border-orange-400"
            >
              Volver al perfil
            </Link>

            <span className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-bold text-red-300">
              {activeRuns.length} run(s)
            </span>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6"
          >
            <h2 className="text-2xl font-black">
              {editingId
                ? "Editar run"
                : "Agregar run"}
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-300">
                  Juego
                </span>

                <input
                  value={form.gameName}
                  onChange={(event) =>
                    updateField("gameName", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="Cuphead"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Categoría
                </span>

                <input
                  value={form.categoryName}
                  onChange={(event) =>
                    updateField("categoryName", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="Any %"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Plataforma / consola
                </span>

                <input
                  value={form.platformName}
                  onChange={(event) =>
                    updateField("platformName", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="PC / Switch / PS5"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Estimado
                </span>

                <input
                  value={form.estimatedTime}
                  onChange={(event) =>
                    updateField("estimatedTime", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="01:20:00"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
    Año de lanzamiento
  </span>

  <input
    type="number"
    min="1950"
    max={new Date().getFullYear()}
    placeholder="Ej. 2017"
    value={form.gameReleaseYear}
    onChange={(event) =>
      updateField(
        "gameReleaseYear",
        event.target.value
      )
    }
    className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
  />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-black px-4 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isRace}
                  onChange={(event) =>
                    updateField("isRace", event.target.checked)
                  }
                />

                <span className="font-bold text-slate-300">
                  Esta run puede ser Race
                </span>
              </label>

              {form.isRace && (
                <label className="block">
                  <span className="text-sm font-bold text-slate-300">
                    Máximo de jugadores
                  </span>

                  <input
                    type="number"
                    min={2}
                    value={form.maxPlayers}
                    onChange={(event) =>
                      updateField("maxPlayers", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  />
                </label>
              )}

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-300">
                  Video demo
                </span>

                <input
                  value={form.videoUrl}
                  onChange={(event) =>
                    updateField("videoUrl", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="YouTube / Twitch VOD"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-300">
                  Descripción / notas
                </span>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className="mt-2 min-h-28 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="Notas para recordar detalles de esta run..."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Agregar a mi biblioteca"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 hover:border-orange-400"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <section className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-black">
              Runs guardadas
            </h2>

            {runs.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-700 p-10 text-center">
                <p className="text-xl font-black">
                  Aún no tienes runs guardadas
                </p>

                <p className="mt-2 text-slate-400">
                  Agrega tu primera run para usarla después en postulaciones.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {runs.map((run) => (
                  <article
                    key={run.id}
                    className="rounded-2xl border border-red-500/20 bg-black/45 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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

                          {run.gameReleaseYear && (
                            <span className="rounded-full bg-slate-700/60 px-3 py-1 text-xs font-black text-slate-200">
                              {run.gameReleaseYear}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-2xl font-black">
                          {run.gameName}
                        </h3>

                        <p className="mt-1 text-slate-300">
                          {run.categoryName} · {run.platformName}
                        </p>

                        {run.description && (
                          <p className="mt-3 text-sm text-slate-400">
                            {run.description}
                          </p>
                        )}

                        {run.videoUrl && (
                          <a
                            href={run.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-sm font-bold text-orange-300 hover:text-orange-200"
                          >
                            Ver video demo
                          </a>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            editRun(run)
                          }
                          className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:border-orange-400"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeRun(run)
                          }
                          className="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-300 hover:bg-red-500/10"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
