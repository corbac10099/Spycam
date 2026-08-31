"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function SgsAccountPage() {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [riotInput, setRiotInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/account");
      const data = await res.json();
      if (data.success && data.user) {
        setAccount(data.user);
        setDisplayName(data.user.name || "");
        setNewEmail(data.user.email || "");
      }
    } catch (e) {
      console.error("Erreur chargement compte SGS:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        setMsg({ text: "Les mots de passe ne correspondent pas.", type: "error" });
        setActionLoading(false);
        return;
      }

      const payload: any = { name: displayName };
      if (newEmail !== account?.email) payload.newEmail = newEmail;
      if (newPassword) {
        payload.newPassword = newPassword;
        payload.currentPassword = currentPassword;
      }

      const res = await fetch("/api/user/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: "Compte SGS mis à jour avec succès !", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        fetchAccount();
      } else {
        setMsg({ text: data.error || "Erreur lors de la mise à jour.", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkRiot = async () => {
    if (!riotInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link-riot",
          data: { riotGameName: riotInput.trim() },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: "Compte Riot Games lié !", type: "success" });
        setRiotInput("");
        fetchAccount();
      } else {
        setMsg({ text: data.error || "Erreur lors de la liaison Riot.", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkRiot = async () => {
    if (!confirm("Voulez-vous vraiment délier votre compte Riot Games ?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink-riot" }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: "Compte Riot Games délié.", type: "success" });
        fetchAccount();
      }
    } catch (err: any) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Votre compte SGS et toutes vos données ont été définitivement supprimés.");
        window.location.href = "/";
      } else {
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-[var(--sgs-red)] tracking-widest">SGS Passport</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">Mon Compte SGS</h1>
        </div>
        <a
          href="http://localhost:3000"
          className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white font-bold text-xs uppercase transition-all"
        >
          Ouvrir Spycam ➔
        </a>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.type === "success" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300" : "bg-red-500/15 border border-red-500/30 text-red-300"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-[var(--sgs-red)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-400 font-bold uppercase">Chargement de votre profil SGS...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* USER HEADER */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg">
                {account?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--sgs-red)] text-white">
                    Compte Vérifié
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    Rôle : <strong className="text-white">{account?.sgsRole || "Membre"}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-black text-white">{account?.name || "Joueur SGS"}</h2>
                <p className="text-xs text-gray-400">{account?.email}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Statut Écosystème</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Synchronisé sur Neon DB
              </span>
            </div>
          </div>

          {/* LINKED PROVIDERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RIOT GAMES */}
            <div className="glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-xs">
                    VAL
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">Compte Riot Games</h3>
                    <p className="text-[11px] text-gray-400">Pour Spycam et les salons vocaux</p>
                  </div>
                </div>
                {account?.isRiotLinked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Connecté
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-700 text-gray-400">
                    Non lié
                  </span>
                )}
              </div>

              {account?.isRiotLinked ? (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-white">{account?.riotGameName}</span>
                  <button
                    onClick={handleUnlinkRiot}
                    disabled={actionLoading}
                    className="text-xs text-red-400 hover:text-red-300 font-bold uppercase underline"
                  >
                    Délier
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={riotInput}
                    onChange={(e) => setRiotInput(e.target.value)}
                    placeholder="ex: Joueur#EUW"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--sgs-red)]"
                  />
                  <button
                    onClick={handleLinkRiot}
                    disabled={actionLoading || !riotInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[var(--sgs-red)] hover:bg-[#ff5e6c] text-white text-xs font-bold uppercase transition-all disabled:opacity-50"
                  >
                    Lier
                  </button>
                </div>
              )}
            </div>

            {/* GOOGLE OAUTH */}
            <div className="glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-black text-xs">
                    G
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">Connexion Google</h3>
                    <p className="text-[11px] text-gray-400">Connexion rapide unifiée</p>
                  </div>
                </div>
                {account?.isGoogleLinked ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Connecté
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-700 text-gray-400">
                    Non lié
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">
                  {account?.googleEmail || account?.email}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Multi-Service</span>
              </div>
            </div>
          </div>

          {/* EDIT FORM */}
          <form onSubmit={handleUpdateProfile} className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Sécurité & Informations Générales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nom d&apos;affichage</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--sgs-red)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Adresse Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--sgs-red)]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-xs font-bold text-gray-300 uppercase block">Changer le mot de passe SGS (Optionnel)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {account?.hasPassword && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--sgs-red)]"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--sgs-red)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-semibold">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--sgs-red)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-3 rounded-xl bg-[var(--sgs-red)] hover:bg-[#ff5e6c] text-white text-xs font-bold uppercase transition-all shadow-lg"
              >
                {actionLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>

          {/* DANGER ZONE */}
          <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black text-red-300 uppercase tracking-wider">
                Zone de Danger (Conformité RGPD)
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                Supprimez définitivement votre compte SGS, vos salons, vos préférences et l&apos;intégralité de vos données associées à toutes les applications de la suite.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold uppercase transition-all"
            >
              Supprimer mon compte
            </button>
          </div>

          {/* DELETE MODAL */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md p-6 rounded-3xl bg-[#0d1117] border border-red-500/40 space-y-4 shadow-2xl">
                <h3 className="text-base font-black text-white text-center uppercase">Suppression Définitive</h3>
                <p className="text-xs text-gray-300 text-center leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer définitivement votre compte SGS (<strong>{account?.email}</strong>) ? Cette action est immédiate et irréversible.
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold uppercase"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase"
                  >
                    Confirmer la suppression
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
