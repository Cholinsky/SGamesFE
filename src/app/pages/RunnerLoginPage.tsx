import {
  type FormEvent,
  useState,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { loginRunner } from "../services/runnerAuthService";

export default function RunnerLoginPage() {
  const navigate =
    useNavigate();

  const [emailOrUsername, setEmailOrUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      await loginRunner({
        emailOrUsername,
        password,
      });

      toast.success(
        "Bienvenido de vuelta, runner."
      );

      navigate("/runner/perfil");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05070c] px-4 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-red-500/30 bg-slate-950/80 p-8 shadow-2xl shadow-red-950/30">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-red-400">
          Runner access
        </p>

        <h1 className="text-4xl font-black">
          Entrar como runner
        </h1>

        <p className="mt-2 text-slate-400">
          Accede a tu perfil para preparar tus runs y futuras postulaciones.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              Email o username
            </span>

            <input
              value={emailOrUsername}
              onChange={(event) =>
                setEmailOrUsername(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="runner@email.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-300">
              Contraseña
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
              placeholder="********"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/runner/registro"
            className="font-bold text-orange-300"
          >
            Crear cuenta runner
          </Link>
        </p>
      </section>
    </main>
  );
}
