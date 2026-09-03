"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

function LoginPageContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e13] text-white p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-val-red)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#58a6ff]/10 rounded-full blur-[120px] pointer-events-none" />

      <LoginModal
        isOpen={true}
        onClose={() => router.push("/")}
        defaultMode="login"
      />
    </div>
  );
}

export default function SpycamLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e13]" />}>
      <LoginPageContent />
    </Suspense>
  );
}