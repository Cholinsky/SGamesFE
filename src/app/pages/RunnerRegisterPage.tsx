import {
  type FormEvent,
  useState,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { registerRunner } from "../services/runnerAuthService";

export default function RunnerRegisterPage() {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      username: "",
      displayName: "",
      email: "",
      password: "",
      country: "",
      timezone: "America/Mexico_City",
      twitchUrl: "",
    });

  const [loading, setLoading] =
    useState(false);

  function updateField(
    key: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      await registerRunner(form);

      toast.success(
        "Cuenta runner creada correctamente."
      );

      navigate("/runner/perfil");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070c] px-4 py-16 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-red-500/30 bg-slate-950/80 p-8 shadow-2xl shadow-red-950/30">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-red-400">
          Runner profile
        </p>

        <h1 className="text-4xl font-black">
          Crear cuenta runner
        </h1>

        <p className="mt-2 text-slate-400">
          Esta cuenta será la base para tu perfil, tus runs y tus postulaciones futuras.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-5 md:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              Username
            </span>

            <input
              value={form.username}
              onChange={(event) =>
                updateField("username", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="cholinsky"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              Nombre público
            </span>

            <input
              value={form.displayName}
              onChange={(event) =>
                updateField("displayName", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="Ch0linsky"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-300">
              Email
            </span>

            <input
              value={form.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="runner@email.com"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-300">
              Contraseña
            </span>

            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                updateField("password", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="mínimo 8 caracteres"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              País
            </span>

            <input
              value={form.country}
              onChange={(event) =>
                updateField("country", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="México"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              Zona horaria
            </span>

            <input
              value={form.timezone}
              onChange={(event) =>
                updateField("timezone", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="America/Mexico_City"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-300">
              Twitch
            </span>

            <input
              value={form.twitchUrl}
              onChange={(event) =>
                updateField("twitchUrl", event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="https://www.twitch.tv/tu_canal"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creando..."
              : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/runner/login"
            className="font-bold text-orange-300"
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
