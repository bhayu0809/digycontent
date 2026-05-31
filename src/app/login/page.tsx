"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Images, Clapperboard, CalendarDays } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Login dibatalkan.",
  config_missing: "Konfigurasi OAuth belum lengkap. Hubungi admin.",
  token_exchange_failed: "Gagal menghubungi Google. Coba lagi.",
  userinfo_failed: "Gagal mengambil data akun dari Google.",
  email_not_verified: "Email Google belum terverifikasi.",
  not_allowed: "Akun ini tidak diizinkan mengakses aplikasi.",
};

const FEATURES = [
  { label: "Carousel", icon: Images, className: "text-violet-600 bg-violet-50 ring-violet-100" },
  { label: "Reels", icon: Clapperboard, className: "text-sky-600 bg-sky-50 ring-sky-100" },
  { label: "Calendar", icon: CalendarDays, className: "text-rose-600 bg-rose-50 ring-rose-100" },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] ?? "Terjadi kesalahan." : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4">
      {/* Decorative colorful blobs — soft, not overwhelming */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Gradient ring wrapper */}
        <div className="rounded-[26px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-violet-600 p-[1.5px] shadow-2xl shadow-violet-500/20">
          <div className="rounded-[25px] bg-white/80 p-8 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <Image
                  src="/digytalab-logo.png"
                  alt="DigytaLab"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Digy
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Content
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">Internal Content Studio · DigytaLab</p>

              {/* Colorful feature chips */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {FEATURES.map((feature) => (
                  <span
                    key={feature.label}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${feature.className}`}
                  >
                    <feature.icon className="h-3.5 w-3.5" />
                    {feature.label}
                  </span>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <a
              href="/api/auth/google"
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/10 active:scale-[0.98]"
            >
              <GoogleIcon />
              Login dengan Google
            </a>

            <p className="mt-6 text-center text-xs text-slate-400">
              Hanya akun yang diizinkan yang bisa masuk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
