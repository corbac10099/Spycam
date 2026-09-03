"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RegisterRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sgsUrl =
      process.env.NEXT_PUBLIC_SGS_URL ||
      (window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : "https://sgs-brown.vercel.app");
    const callback = searchParams.get("callbackUrl") || window.location.origin;
    const targetUrl = `${sgsUrl}/register?callbackUrl=${encodeURIComponent(callback)}`;

    if (window.location.href !== targetUrl && sgsUrl !== window.location.origin) {
      window.location.replace(targetUrl);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e13] text-white p-4 space-y-4">
      <div className="w-10 h-10 border-3 border-[var(--color-val-red)] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Redirection vers la création de compte SGS...
      </p>
    </div>
  );
}

export default function SpycamRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e13]" />}>
      <RegisterRedirect />
    </Suspense>
  );
}