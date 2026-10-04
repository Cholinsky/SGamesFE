import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  clearRunnerToken,
  deleteRunnerAccount,
  getRunnerMe,
  type RunnerAccountMe,
  updateRunnerMe,
  uploadRunnerBannerImage,
  uploadRunnerProfileImage,
} from "../services/runnerAuthService";

const defaultProfile = {
  displayName: "",
  country: "",
  timezone: "America/Mexico_City",
  discordUser: "",
  twitchUrl: "",
  youTubeUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  profileImageUrl: "",
  bannerImageUrl: "",
  bio: "",
  pronouns: "",
  favoriteGame: "",
  profileColor: "#EF4444",
  isPublicProfile: true,
};

export default function RunnerProfilePage() {
  const navigate =
    useNavigate();

  const [runner, setRunner] =
    useState<RunnerAccountMe | null>(null);

  const [form, setForm] =
    useState(defaultProfile);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const [uploadingBanner, setUploadingBanner] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const data =
          await getRunnerMe();

        if (cancelled) {
          return;
        }

        setRunner(data);

        setForm({
          displayName: data.displayName ?? "",
          country: data.country ?? "",
          timezone: data.timezone ?? "America/Mexico_City",
          discordUser: data.discordUser ?? "",
          twitchUrl: data.twitchUrl ?? "",
          youTubeUrl: data.youTubeUrl ?? "",
          twitterUrl: data.twitterUrl ?? "",
          instagramUrl: data.instagramUrl ?? "",
          profileImageUrl: data.profileImageUrl ?? "",
          bannerImageUrl: data.bannerImageUrl ?? "",
          bio: data.bio ?? "",
          pronouns: data.pronouns ?? "",
          favoriteGame: data.favoriteGame ?? "",
          profileColor: data.profileColor ?? "#EF4444",
          isPublicProfile: data.isPublicProfile,
        });
      } catch {
        clearRunnerToken();
        navigate("/runner/login");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: typeof form[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function syncProfileFromRunner(
    data: RunnerAccountMe
  ) {
    setRunner(data);

    setForm((current) => ({
      ...current,
      profileImageUrl:
        data.profileImageUrl ?? "",
      bannerImageUrl:
        data.bannerImageUrl ?? "",
    }));
  }

  async function handleAvatarUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    try {
      setUploadingAvatar(true);

      const updated =
        await uploadRunnerProfileImage(file);

      syncProfileFromRunner(updated);

      toast.success(
        "Imagen de perfil actualizada."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen de perfil."
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleBannerUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    try {
      setUploadingBanner(true);

      const updated =
        await uploadRunnerBannerImage(file);

      syncProfileFromRunner(updated);

      toast.success(
        "Banner actualizado."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo subir el banner."
      );
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleSave(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      const updated =
        await updateRunnerMe(form);

      setRunner(updated);

      toast.success(
        "Perfil runner actualizado."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "¿Seguro que quieres desactivar tu cuenta runner? Esta acción cerrará tu sesión."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRunnerAccount();

      toast.success(
        "Cuenta runner desactivada."
      );

      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo desactivar la cuenta."
      );
    }
  }

  function logout() {
    clearRunnerToken();
    navigate("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070c] px-4 py-16 text-white">
        <p className="text-center text-slate-400">
          Cargando perfil runner...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070c] px-4 py-10 text-white">
      <section className="mx-auto max-w-6xl space-y-6">
        <div
          className="overflow-hidden rounded-3xl border border-red-500/30 bg-slate-950 shadow-2xl shadow-red-950/30"
          style={{
            borderColor: form.profileColor || "#EF4444",
          }}
        >
          <div
            className="h-44 bg-gradient-to-r from-red-950 via-orange-950 to-slate-950"
            style={{
              backgroundImage: form.bannerImageUrl
                ? `linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${form.bannerImageUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="-mt-16 flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div
                className="h-32 w-32 rounded-3xl border-4 border-slate-950 bg-slate-900 bg-cover bg-center"
                style={{
                  backgroundImage: form.profileImageUrl
                    ? `url(${form.profileImageUrl})`
                    : undefined,
                }}
              />

              <div className="pb-2">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
                  @{runner?.username}
                </p>

                <h1 className="text-4xl font-black">
                  {form.displayName || "Runner"}
                </h1>

                <p className="mt-1 text-slate-400">
                  {form.favoriteGame || "Speedrunner"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={logout}
                className="rounded-2xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:border-orange-400"
              >
                Cerrar sesión
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-2xl border border-red-500/40 px-4 py-2 font-bold text-red-300 hover:bg-red-500/10"
              >
                Desactivar cuenta
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"
        >
          <section className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-black">
              Personalización básica
            </h2>

            <p className="mt-1 text-slate-400">
              Estos datos preparan tu perfil público y tus futuras postulaciones.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
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
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Pronombres
                </span>

                <input
                  value={form.pronouns}
                  onChange={(event) =>
                    updateField("pronouns", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="he/him, she/her, they/them..."
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
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Juego favorito
                </span>

                <input
                  value={form.favoriteGame}
                  onChange={(event) =>
                    updateField("favoriteGame", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Color de perfil
                </span>

                <input
                  type="color"
                  value={form.profileColor}
                  onChange={(event) =>
                    updateField("profileColor", event.target.value)
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-red-500/25 bg-black px-2 py-2"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-300">
                  Bio
                </span>

                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  className="mt-2 min-h-28 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="Cuéntanos un poco de ti como runner..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-black px-4 py-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isPublicProfile}
                  onChange={(event) =>
                    updateField("isPublicProfile", event.target.checked)
                  }
                />

                <span className="font-bold text-slate-300">
                  Perfil público visible
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-red-500/25 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-black">
              Redes e imágenes
            </h2>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-orange-500/25 bg-black/40 p-4">
                <span className="text-sm font-bold text-slate-300">
                  Imagen de perfil
                </span>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-black text-black transition hover:scale-[1.01]">
                    {uploadingAvatar
                      ? "Subiendo..."
                      : "Subir avatar"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP o GIF. Máximo 5 MB.
                  </p>
                </div>

                <input
                  value={form.profileImageUrl}
                  onChange={(event) =>
                    updateField("profileImageUrl", event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="También puedes pegar una URL manualmente"
                />
              </div>

              <div className="rounded-2xl border border-orange-500/25 bg-black/40 p-4">
                <span className="text-sm font-bold text-slate-300">
                  Banner de perfil
                </span>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-black text-black transition hover:scale-[1.01]">
                    {uploadingBanner
                      ? "Subiendo..."
                      : "Subir banner"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleBannerUpload}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP o GIF. Máximo 8 MB.
                  </p>
                </div>

                <input
                  value={form.bannerImageUrl}
                  onChange={(event) =>
                    updateField("bannerImageUrl", event.target.value)
                  }
                  className="mt-3 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400"
                  placeholder="También puedes pegar una URL manualmente"
                />
              </div>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Twitch
                </span>
                <input value={form.twitchUrl} onChange={(event) => updateField("twitchUrl", event.target.value)} className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400" />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  YouTube
                </span>
                <input value={form.youTubeUrl} onChange={(event) => updateField("youTubeUrl", event.target.value)} className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400" />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Twitter / X
                </span>
                <input value={form.twitterUrl} onChange={(event) => updateField("twitterUrl", event.target.value)} className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400" />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Instagram
                </span>
                <input value={form.instagramUrl} onChange={(event) => updateField("instagramUrl", event.target.value)} className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400" />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-300">
                  Discord
                </span>
                <input value={form.discordUser} onChange={(event) => updateField("discordUser", event.target.value)} className="mt-2 w-full rounded-2xl border border-red-500/25 bg-black px-4 py-3 text-white outline-none focus:border-orange-400" />
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving || uploadingAvatar || uploadingBanner}
            className="lg:col-span-2 w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Guardando..."
              : "Guardar perfil runner"}
          </button>
        </form>
      </section>
    </main>
  );
}
