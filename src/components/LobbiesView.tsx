"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sounds } from "@/lib/soundEffects";
import { LobbyItem, LobbyMember, VoiceMember, ChatMessage, getTierName } from "@/app/api/lobbies/route";
import { VoiceManager } from "@/lib/voiceManager";
import { filterToxicText } from "@/lib/moderation";

interface LobbiesViewProps {
  playerData?: any;
  isPublic?: boolean;
  onUpdateIsPublic?: (val: boolean) => void;
  onSelectPlayer?: (riotId: string) => void;
}

const ROLES_LIST = [
  { id: "Duelliste", label: "Duelliste", icon: "⚔️" },
  { id: "Initiateur", label: "Initiateur", icon: "🎯" },
  { id: "Contrôleur", label: "Contrôleur", icon: "💨" },
  { id: "Sentinelle", label: "Sentinelle", icon: "🛡️" },
  { id: "Tous Rôles", label: "Tous Rôles", icon: "✨" },
];

export default function LobbiesView({
  playerData,
  isPublic = true,
  onUpdateIsPublic,
  onSelectPlayer,
}: LobbiesViewProps) {
  // Navigation states: 'landing' | 'create' | 'join' | 'salon'
  const [currentView, setCurrentView] = useState<"landing" | "create" | "join" | "salon">("landing");

  // Active Lobby State (when in 'salon' view)
  const [activeLobby, setActiveLobby] = useState<LobbyItem | null>(null);

  // All Lobbies State
  const [lobbies, setLobbies] = useState<LobbyItem[]>([]);
  const [loadingLobbies, setLoadingLobbies] = useState<boolean>(false);

  // Player identity fallback
  const myName = playerData?.gameName || playerData?.player?.gameName || "Joueur";
  const myTag = playerData?.tagLine || playerData?.player?.tagLine || "EUW";
  const myRank = playerData?.rank || playerData?.player?.rank || "Ascendant 1";
  const myRankUrl =
    playerData?.rankUrl ||
    playerData?.player?.rankUrl ||
    "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/largeicon.png";
  const myRankTier = playerData?.rankTier ?? playerData?.player?.rankTier ?? 21;
  const myAvatar =
    playerData?.cardUrl ||
    playerData?.player?.cardUrl ||
    playerData?.player?.cardSmall ||
    "https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png";

  // ==================== CREATE FORM STATE ====================
  const [createLeaderRoles, setCreateLeaderRoles] = useState<string[]>(["Duelliste"]);
  const [createTeammates, setCreateTeammates] = useState<LobbyMember[]>([]);
  const [newMateRiotId, setNewMateRiotId] = useState<string>("");
  const [checkingMate, setCheckingMate] = useState<boolean>(false);
  const [createMode, setCreateMode] = useState<string>("Compétitif");
  const [createRolesNeeded, setCreateRolesNeeded] = useState<string[]>(["Initiateur", "Contrôleur"]);
  const [createMic, setCreateMic] = useState<"yes" | "no" | "optional">("yes");
  const [createSlotsNeeded, setCreateSlotsNeeded] = useState<number>(3);
  const [createNote, setCreateNote] = useState<string>("");
  const [createRegion, setCreateRegion] = useState<string>("EU / Paris");
  const [createError, setCreateError] = useState<string>("");

  // ==================== JOIN FILTER STATE ====================
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterSlots, setFilterSlots] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState<string>("");

  // ==================== SALON REAL-TIME STATE ====================
  const [chatMessage, setChatMessage] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevChatLengthRef = useRef<number>(0);

  // ==================== VOICE WEBRTC STATE ====================
  const [isInVoice, setIsInVoice] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isMyVoiceSpeaking, setIsMyVoiceSpeaking] = useState<boolean>(false);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState<number>(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  // Fetch Lobbies list
  const fetchLobbies = async () => {
    try {
      setLoadingLobbies(true);
      const res = await fetch("/api/lobbies");
      const data = await res.json();
      if (data.success && data.lobbies) {
        setLobbies(data.lobbies);
      }
    } catch (err) {
      console.error("Failed to load lobbies:", err);
    } finally {
      setLoadingLobbies(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  // Polling for active salon updates
  useEffect(() => {
    if (currentView !== "salon" || !activeLobby) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lobbies/${activeLobby.id}`);
        const data = await res.json();
        if (data.success && data.lobby) {
          setActiveLobby(data.lobby);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [currentView, activeLobby]);

  // Scroll ONLY the internal chat container when a new message arrives (never window)
  useEffect(() => {
    if (currentView === "salon" && activeLobby?.chat) {
      const currentLen = activeLobby.chat.length;
      if (currentLen > prevChatLengthRef.current) {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
      prevChatLengthRef.current = currentLen;
    }
  }, [activeLobby?.chat?.length, currentView]);

  // Voice State Sync to Backend
  const syncVoiceStateToBackend = useCallback(
    async (speaking: boolean, muted: boolean) => {
      if (!activeLobby) return;
      try {
        await fetch(`/api/lobbies/${activeLobby.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "voice-state",
            gameName: myName,
            tagLine: myTag,
            isSpeaking: speaking,
            isMuted: muted,
          }),
        });
      } catch {}
    },
    [activeLobby, myName, myTag]
  );

  // Décrocher 📞 (Rejoindre le canal vocal)
  const handleJoinVoice = async () => {
    setVoiceError(null);
    sounds.playTabSwitch();

    const vm = new VoiceManager({
      onSpeakingChange: (speaking, vol) => {
        setIsMyVoiceSpeaking(speaking);
        setVoiceVolumeLevel(vol);
        syncVoiceStateToBackend(speaking, isMicMuted);
      },
      onTranscript: async (transcriptText) => {
        if (!activeLobby) return;
        try {
          await fetch(`/api/lobbies/${activeLobby.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "voice-transcript",
              senderName: myName,
              senderTag: myTag,
              content: transcriptText,
            }),
          });
        } catch {}
      },
      onError: (err) => {
        setVoiceError(err);
      },
    });

    const success = await vm.start();
    if (success) {
      voiceManagerRef.current = vm;
      setIsInVoice(true);
      setIsMicMuted(false);
      sounds.playClick();

      if (activeLobby) {
        try {
          const res = await fetch(`/api/lobbies/${activeLobby.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "voice-join",
              memberId: `v_${myName}_${myTag}`,
              gameName: myName,
              tagLine: myTag,
              avatarUrl: myAvatar,
              rank: myRank,
              isPrivateRank: !isPublic,
            }),
          });
          const data = await res.json();
          if (data.success && data.voiceMembers) {
            setActiveLobby((prev) => (prev ? { ...prev, voiceMembers: data.voiceMembers } : null));
          }
        } catch {}
      }
    }
  };

  // Raccrocher 🔴 (Quitter le canal vocal)
  const handleLeaveVoice = async () => {
    sounds.playClick();
    if (voiceManagerRef.current) {
      voiceManagerRef.current.stop();
      voiceManagerRef.current = null;
    }
    setIsInVoice(false);
    setIsMyVoiceSpeaking(false);

    if (activeLobby) {
      try {
        const res = await fetch(`/api/lobbies/${activeLobby.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "voice-leave",
            gameName: myName,
            tagLine: myTag,
          }),
        });
        const data = await res.json();
        if (data.success && data.voiceMembers) {
          setActiveLobby((prev) => (prev ? { ...prev, voiceMembers: data.voiceMembers } : null));
        }
      } catch {}
    }
  };

  // Clean voice on unmount or leaving salon
  useEffect(() => {
    return () => {
      if (voiceManagerRef.current) {
        voiceManagerRef.current.stop();
      }
    };
  }, []);

  // Calculate live lobby estimated level during creation
  const calculateEstimatedLevel = () => {
    const allMembers = [
      { rankTier: myRankTier, isPrivateRank: false },
      ...createTeammates,
    ];
    const known = allMembers.filter((m) => !m.isPrivateRank && m.rankTier && m.rankTier > 0).map((m) => m.rankTier!);
    const avg = known.length > 0 ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : myRankTier;
    return getTierName(avg);
  };

  // Add teammate with Riot ID lookup
  const handleAddTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateRiotId.trim()) return;

    setCheckingMate(true);
    setCreateError("");
    try {
      sounds.playTyping();
      const res = await fetch("/api/valorant/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId: newMateRiotId.trim() }),
      });
      const data = await res.json();

      const hashIndex = newMateRiotId.lastIndexOf("#");
      const gName = hashIndex !== -1 ? newMateRiotId.substring(0, hashIndex) : newMateRiotId;
      const tLine = hashIndex !== -1 ? newMateRiotId.substring(hashIndex + 1) : "EUW";

      if (res.ok && data && (data.rank || data.player?.rank)) {
        const rName = data.rank || data.player?.rank || "Non-classé";
        const rUrl = data.rankUrl || data.player?.rankUrl || "";
        const rTier = data.rankTier ?? data.player?.rankTier ?? 12;

        const mate: LobbyMember = {
          id: `mate_${Date.now()}`,
          gameName: data.gameName || data.player?.gameName || gName,
          tagLine: data.tagLine || data.player?.tagLine || tLine,
          rank: rName,
          rankUrl: rUrl,
          rankTier: rTier,
          isPrivateRank: false,
          roles: ["Tous Rôles"],
          isLeader: false,
          avatarUrl: data.cardUrl || data.player?.cardUrl || data.player?.cardSmall,
        };
        setCreateTeammates((prev) => [...prev, mate]);
      } else {
        const privateMate: LobbyMember = {
          id: `mate_${Date.now()}`,
          gameName: gName,
          tagLine: tLine,
          rank: "Privé",
          rankTier: 12,
          isPrivateRank: true,
          roles: ["Tous Rôles"],
          isLeader: false,
        };
        setCreateTeammates((prev) => [...prev, privateMate]);
      }
      setNewMateRiotId("");
    } catch {
      const hashIndex = newMateRiotId.lastIndexOf("#");
      const gName = hashIndex !== -1 ? newMateRiotId.substring(0, hashIndex) : newMateRiotId;
      const tLine = hashIndex !== -1 ? newMateRiotId.substring(hashIndex + 1) : "EUW";
      const privateMate: LobbyMember = {
        id: `mate_${Date.now()}`,
        gameName: gName,
        tagLine: tLine,
        rank: "Privé",
        rankTier: 12,
        isPrivateRank: true,
        roles: ["Tous Rôles"],
        isLeader: false,
      };
      setCreateTeammates((prev) => [...prev, privateMate]);
      setNewMateRiotId("");
    } finally {
      setCheckingMate(false);
    }
  };

  // Submit Create Lobby
  const handleCreateSubmit = async () => {
    if (!isPublic) {
      setCreateError("Vous devez impérativement passer votre profil en public pour créer un salon.");
      return;
    }

    try {
      sounds.playClick();
      const payload = {
        leaderName: myName,
        leaderTag: myTag,
        leaderRank: myRank,
        leaderRankUrl: myRankUrl,
        leaderRankTier: myRankTier,
        isLeaderPrivate: false,
        leaderAvatar: myAvatar,
        leaderRoles: createLeaderRoles,
        members: createTeammates,
        mode: createMode,
        roleNeeded: createRolesNeeded,
        micRequired: createMic,
        maxSlots: 1 + createTeammates.length + createSlotsNeeded,
        note: createNote,
        region: createRegion,
      };

      const res = await fetch("/api/lobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.lobby) {
        setActiveLobby(data.lobby);
        setCurrentView("salon");
        fetchLobbies();
      } else {
        setCreateError(data.error || "Erreur lors de la création du salon.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Erreur de connexion.");
    }
  };

  // Join a Lobby
  const handleJoinLobby = async (lobby: LobbyItem) => {
    try {
      sounds.playClick();
      const res = await fetch(`/api/lobbies/${lobby.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          gameName: myName,
          tagLine: myTag,
          rank: myRank,
          rankUrl: myRankUrl,
          rankTier: myRankTier,
          isPrivateRank: !isPublic,
          roles: createLeaderRoles,
          avatarUrl: myAvatar,
        }),
      });
      const data = await res.json();
      if (data.success && data.lobby) {
        setActiveLobby(data.lobby);
        setCurrentView("salon");
      }
    } catch (err) {
      console.error("Error joining lobby:", err);
    }
  };

  // Send Moderated Chat Message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeLobby) return;

    const rawText = chatMessage.trim();
    const mod = filterToxicText(rawText);

    if (mod.isToxic) {
      setModerationWarning("Certains termes ont été automatiquement masqués pour respecter les règles de bienséance.");
      setTimeout(() => setModerationWarning(null), 4000);
    }

    setChatMessage("");

    try {
      sounds.playTyping();
      const res = await fetch(`/api/lobbies/${activeLobby.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          senderName: myName,
          senderTag: myTag,
          senderAvatar: myAvatar,
          content: rawText,
        }),
      });
      const data = await res.json();
      if (data.success && data.chat) {
        setActiveLobby((prev) => (prev ? { ...prev, chat: data.chat } : null));
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Leave Active Salon
  const handleLeaveSalon = async () => {
    if (!activeLobby) return;
    if (isInVoice) {
      await handleLeaveVoice();
    }
    try {
      sounds.playClick();
      await fetch(`/api/lobbies/${activeLobby.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          gameName: myName,
          tagLine: myTag,
        }),
      });
    } catch {}
    setActiveLobby(null);
    setCurrentView("landing");
    fetchLobbies();
  };

  const handleCopyRiotId = (id: string) => {
    sounds.playBreeze();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter lobbies
  const filteredLobbies = lobbies.filter((l) => {
    if (filterMode !== "all" && l.mode !== filterMode) return false;
    if (filterRole !== "all" && !l.roleNeeded.includes(filterRole) && !l.roleNeeded.includes("Tous Rôles"))
      return false;
    if (filterSlots !== "all") {
      const remaining = l.maxSlots - l.currentSlots;
      if (filterSlots === "1" && remaining !== 1) return false;
      if (filterSlots === "2+" && remaining < 2) return false;
    }
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchLeader = l.leaderName.toLowerCase().includes(q);
      const matchRank = l.leaderRank.toLowerCase().includes(q);
      const matchNote = l.note.toLowerCase().includes(q);
      if (!matchLeader && !matchRank && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* ========================================================================= */}
      {/* VUE 1 : LANDING (DEUX GRANDES SECTIONS : CRÉER / REJOINDRE)              */}
      {/* ========================================================================= */}
      {currentView === "landing" && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-[var(--color-border)] relative overflow-hidden text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/30 text-[var(--color-val-red)] text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--color-val-red)] animate-ping"></span>
              <span>LFG • Salons Valorant Sécurisés</span>
              <span className="text-[var(--color-text-secondary)] font-normal">• {lobbies.length} Salons Actifs</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Trouvez votre <span className="text-[var(--color-val-red)]">Escouade</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl mx-auto">
              Créez votre salon avec votre rang et vos coéquipiers, ou rejoignez des joueurs avec chat textuel modéré et canal vocal en direct !
            </p>
          </div>

          {/* TWO MAIN CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARTE 1 : CRÉER UN SALON */}
            <div
              onClick={() => {
                sounds.playClick();
                setCurrentView("create");
              }}
              className="glass-panel group rounded-3xl p-8 border border-[var(--color-border)] hover:border-[var(--color-val-red)] transition-all duration-300 cursor-pointer flex flex-col justify-between gap-6 relative overflow-hidden shadow-2xl hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-val-red)]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--color-val-red)]/20 transition-all"></div>

              <div className="space-y-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/40 flex items-center justify-center text-3xl shadow-lg">
                  ➕
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-val-red)]">
                    Chef d&apos;escouade
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">Créer un Salon</h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    Définissez les rôles recherchés, ajoutez les pseudos de vos mates déjà présents, et laissez Spycam calculer automatiquement le niveau du salon.
                  </p>
                </div>

                {/* Identity Preview */}
                <div className="p-3.5 rounded-2xl bg-[var(--color-background)]/80 border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {myAvatar && <img src={myAvatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover" />}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {myName}#{myTag}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {myRankUrl && <img src={myRankUrl} alt={myRank} className="w-4 h-4 object-contain" />}
                        <span className="text-[10px] font-bold text-[var(--color-val-light)] uppercase">{myRank}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    Prêt
                  </span>
                </div>
              </div>

              <button className="w-full py-3.5 rounded-2xl bg-[var(--color-val-red)] hover:bg-[#ff5e6c] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[rgba(255,70,85,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Créer mon Salon</span>
                <span>➔</span>
              </button>
            </div>

            {/* CARTE 2 : REJOINDRE UN SALON */}
            <div
              onClick={() => {
                sounds.playClick();
                setCurrentView("join");
              }}
              className="glass-panel group rounded-3xl p-8 border border-[var(--color-border)] hover:border-sky-500 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-6 relative overflow-hidden shadow-2xl hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/20 transition-all"></div>

              <div className="space-y-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-3xl shadow-lg">
                  🔍
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                    Trouver un groupe
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">Rejoindre un Salon</h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    Filtrez par rôle joué et taille d&apos;escouade. Spycam analyse votre rang et vous propose les salons adaptés à votre niveau avec chat &amp; vocal.
                  </p>
                </div>

                {/* Available Lobbies Pill */}
                <div className="p-3.5 rounded-2xl bg-[var(--color-background)]/80 border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎮</span>
                    <span className="text-xs font-bold text-white">Salons disponibles maintenant</span>
                  </div>
                  <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    {lobbies.length} salons
                  </span>
                </div>
              </div>

              <button className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Parcourir &amp; Rejoindre</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : CRÉER UN SALON                                                    */}
      {/* ========================================================================= */}
      {currentView === "create" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button & Title */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentView("landing");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <span>←</span>
              <span>Retour</span>
            </button>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Création de Salon LFG</h2>
            <div className="w-16"></div>
          </div>

          {/* Bloqueur si profil privé */}
          {!isPublic && (
            <div className="glass-panel rounded-3xl p-6 border-2 border-[var(--color-val-red)] bg-red-950/30 text-center space-y-4 animate-in shake">
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-black text-white uppercase">Votre profil est actuellement privé</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                Pour créer un salon et trouver des coéquipiers, votre profil doit obligatoirement être public afin que vos futurs coéquipiers puissent voir votre rang réel.
              </p>
              {onUpdateIsPublic && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onUpdateIsPublic(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[var(--color-val-red)] hover:bg-[#ff5e6c] text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  Rendre mon profil public
                </button>
              )}
            </div>
          )}

          {isPublic && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] space-y-6 shadow-2xl">
              {createError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-200 text-xs text-center font-bold">
                  {createError}
                </div>
              )}

              {/* Leader Identity Card */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-wider">
                  1. Votre Profil (Chef de Groupe)
                </label>
                <div className="p-4 rounded-2xl bg-[var(--color-background)]/90 border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {myAvatar && <img src={myAvatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-white/20" />}
                    <div>
                      <div className="text-sm font-black text-white">
                        {myName}#{myTag}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {myRankUrl && <img src={myRankUrl} alt={myRank} className="w-4 h-4 object-contain" />}
                        <span className="text-xs font-bold text-[var(--color-val-light)] uppercase">{myRank}</span>
                      </div>
                    </div>
                  </div>

                  {/* Leader Roles Selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">Vos Rôles joués :</span>
                    <div className="flex flex-wrap gap-1">
                      {ROLES_LIST.slice(0, 4).map((role) => {
                        const isSelected = createLeaderRoles.includes(role.id);
                        return (
                          <button
                            type="button"
                            key={role.id}
                            onClick={() => {
                              sounds.playClick();
                              setCreateLeaderRoles((prev) =>
                                isSelected ? prev.filter((r) => r !== role.id) : [...prev, role.id]
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[var(--color-val-red)] text-white border-[var(--color-val-red)]"
                                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                            }`}
                          >
                            {role.icon} {role.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coéquipiers déjà présents dans le lobby Valorant */}
              <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-wider">
                      2. Coéquipiers déjà dans votre groupe Valorant
                    </label>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Ajoutez les Riot ID de vos amis déjà présents dans votre lobby Valorant.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-val-red)]">
                    {createTeammates.length} ami(s) ajouté(s)
                  </span>
                </div>

                {/* Input Add Mate */}
                <form onSubmit={handleAddTeammate} className="flex gap-2">
                  <input
                    type="text"
                    value={newMateRiotId}
                    onChange={(e) => setNewMateRiotId(e.target.value)}
                    placeholder="Ex: Shroud#0001"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-val-red)] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={checkingMate || !newMateRiotId.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-val-red)] text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer border border-[var(--color-border)]"
                  >
                    {checkingMate ? "Vérification..." : "➕ Ajouter"}
                  </button>
                </form>

                {/* Teammates List */}
                {createTeammates.length > 0 && (
                  <div className="space-y-2">
                    {createTeammates.map((mate, idx) => (
                      <div
                        key={mate.id}
                        className="p-3 rounded-xl bg-[var(--color-background)]/60 border border-[var(--color-border)] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-white/10 flex items-center justify-center text-xs font-black text-white">
                            {idx + 2}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {mate.gameName}#{mate.tagLine}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {mate.isPrivateRank ? (
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                  <span>🔒</span>
                                  <span>Rang Privé</span>
                                </span>
                              ) : (
                                <>
                                  {mate.rankUrl && <img src={mate.rankUrl} alt={mate.rank} className="w-3.5 h-3.5 object-contain" />}
                                  <span className="text-[10px] font-bold text-[var(--color-val-light)] uppercase">{mate.rank}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-1">
                            {ROLES_LIST.slice(0, 4).map((role) => {
                              const isSelected = mate.roles.includes(role.id);
                              return (
                                <button
                                  type="button"
                                  key={role.id}
                                  onClick={() => {
                                    const updated = createTeammates.map((m) => {
                                      if (m.id !== mate.id) return m;
                                      const nextRoles = isSelected
                                        ? m.roles.filter((r) => r !== role.id)
                                        : [...m.roles.filter((r) => r !== "Tous Rôles"), role.id];
                                      return { ...m, roles: nextRoles.length ? nextRoles : ["Tous Rôles"] };
                                    });
                                    setCreateTeammates(updated);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                    isSelected
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                      : "bg-black/20 text-gray-400 border-white/5"
                                  }`}
                                >
                                  {role.icon}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setCreateTeammates((prev) => prev.filter((m) => m.id !== mate.id))}
                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-500/10 border border-red-500/20 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rôles recherchés & Places manquantes */}
              <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                <label className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-wider">
                  3. Places &amp; Rôles recherchés
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Nombre de personnes recherchées</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCreateSlotsNeeded(num)}
                          className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            createSlotsNeeded === num
                              ? "bg-[var(--color-val-red)] text-white border-[var(--color-val-red)]"
                              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                          }`}
                        >
                          +{num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Mode de Jeu</span>
                    <select
                      value={createMode}
                      onChange={(e) => setCreateMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white focus:outline-none"
                    >
                      <option value="Compétitif">Compétitif (Ranked)</option>
                      <option value="Non-classé">Non-classé (Unrated)</option>
                      <option value="Premier">Tournoi Premier</option>
                      <option value="Vélocité">Vélocité (Swiftplay)</option>
                    </select>
                  </div>
                </div>

                {/* Roles Needed Selection */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">Rôles recherchés pour les places manquantes :</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {ROLES_LIST.map((role) => {
                      const isSelected = createRolesNeeded.includes(role.id);
                      return (
                        <button
                          type="button"
                          key={role.id}
                          onClick={() => {
                            sounds.playClick();
                            setCreateRolesNeeded((prev) =>
                              isSelected ? prev.filter((r) => r !== role.id) : [...prev, role.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md"
                              : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          <span>{role.icon}</span>
                          <span>{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mic & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Microphone</span>
                    <select
                      value={createMic}
                      onChange={(e) => setCreateMic(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white focus:outline-none"
                    >
                      <option value="yes">🎙️ Micro Requis</option>
                      <option value="optional">🔇 Micro Optionnel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Région / Serveur</span>
                    <select
                      value={createRegion}
                      onChange={(e) => setCreateRegion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white focus:outline-none"
                    >
                      <option value="EU / Paris">EU / Paris (FR)</option>
                      <option value="EU / Frankfurt">EU / Frankfurt (DE)</option>
                      <option value="EU / London">EU / London (UK)</option>
                      <option value="EU / Madrid">EU / Madrid (ES)</option>
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)]">Description / Objectif</span>
                  <textarea
                    rows={2}
                    value={createNote}
                    onChange={(e) => setCreateNote(e.target.value)}
                    placeholder="Ex: Duo cherche Smokes et Flash pour monter Immortal ce soir. Vocal posé !"
                    className="w-full p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-val-red)]"
                  />
                </div>
              </div>

              {/* LIVE ESTIMATED LOBBY LEVEL CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--color-val-red)]/15 via-purple-500/10 to-transparent border border-[var(--color-val-red)]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-[var(--color-val-red)] tracking-wider">
                      Calcul Automatique du Niveau
                    </span>
                    <div className="text-sm font-black text-white">
                      Niveau estimé du lobby : <span className="text-[var(--color-val-light)]">{calculateEstimatedLevel()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white/80">
                    {1 + createTeammates.length}/{1 + createTeammates.length + createSlotsNeeded} Joueurs
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView("landing")}
                  className="px-5 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-xs font-bold uppercase cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="px-8 py-3.5 rounded-xl bg-[var(--color-val-red)] hover:bg-[#ff5e6c] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-[rgba(255,70,85,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Publier mon Salon</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 3 : REJOINDRE UN SALON (MATCHING & FILTRES)                           */}
      {/* ========================================================================= */}
      {currentView === "join" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentView("landing");
                }}
                className="px-4 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>Retour</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase">Recherche de Salons</h2>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setCurrentView("create");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--color-val-red)] text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
            >
              ➕ Créer mon Salon
            </button>
          </div>

          {/* FILTRES INTERACTIFS */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              {/* Filter by Role */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)] mr-1">Rôle :</span>
                {[{ id: "all", label: "Tous", icon: "✨" }, ...ROLES_LIST.slice(0, 4)].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      sounds.playHover();
                      setFilterRole(r.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                      filterRole === r.id
                        ? "bg-[var(--color-val-red)] text-white border-[var(--color-val-red)] shadow-md"
                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative min-w-[200px]">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Pseudo, rang, mot-clé..."
                  className="w-full px-3 py-1.5 pl-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-val-red)]"
                />
                <span className="absolute left-2.5 top-2 text-gray-500 text-xs">🔍</span>
              </div>
            </div>
          </div>

          {/* GRILLE DES SALONS */}
          {loadingLobbies ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-[var(--color-val-red)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">Recherche des salons...</p>
            </div>
          ) : filteredLobbies.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-[var(--color-border)] space-y-3">
              <div className="text-4xl">🎮</div>
              <h3 className="text-base font-bold text-white uppercase">Aucun salon ne correspond actuellement</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                Soyez le premier à ouvrir un salon adapté à votre rang !
              </p>
              <button
                onClick={() => setCurrentView("create")}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-val-red)] text-white text-xs font-black uppercase tracking-wider mt-2 cursor-pointer shadow-lg"
              >
                Créer un Salon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="glass-panel rounded-3xl p-5 border border-[var(--color-border)] hover:border-[var(--color-val-red)]/60 transition-all flex flex-col justify-between gap-4 shadow-xl hover:shadow-2xl relative overflow-hidden group"
                >
                  {/* Header info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {lobby.leaderAvatar ? (
                          <img src={lobby.leaderAvatar} alt={lobby.leaderName} className="w-11 h-11 rounded-xl object-cover border border-white/20 flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#1a232e] border border-white/20 flex items-center justify-center text-white font-black flex-shrink-0">
                            {lobby.leaderName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-white truncate">{lobby.leaderName}</span>
                            <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">#{lobby.leaderTag}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {lobby.leaderRankUrl && <img src={lobby.leaderRankUrl} alt={lobby.leaderRank} className="w-3.5 h-3.5 object-contain" />}
                            <span className="text-[10px] font-bold text-[var(--color-val-light)] uppercase">{lobby.leaderRank}</span>
                          </div>
                        </div>
                      </div>

                      {/* Level Badge */}
                      <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[var(--color-val-red)]/20 to-purple-500/20 border border-[var(--color-val-red)]/40 text-[var(--color-val-light)] text-[10px] font-black uppercase whitespace-nowrap">
                        Niveau : {lobby.lobbyLevel}
                      </span>
                    </div>

                    {/* Mode & Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/30 text-[var(--color-val-red)] text-[10px] font-black uppercase">
                        {lobby.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 text-[10px] font-semibold">
                        📍 {lobby.region}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${lobby.micRequired === "yes" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-gray-500/15 border-gray-500/30 text-gray-400"}`}>
                        {lobby.micRequired === "yes" ? "🎙️ Vocal" : "🔇 Optionnel"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold">
                        👥 {lobby.currentSlots}/{lobby.maxSlots} Places
                      </span>
                    </div>

                    {/* Membres dans le groupe preview */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Membres actuels :</span>
                      <div className="flex flex-wrap gap-1">
                        {lobby.members?.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-bold text-white flex items-center gap-1"
                          >
                            <span>{m.isLeader ? "👑" : "👤"}</span>
                            <span>{m.gameName}</span>
                            {m.isPrivateRank ? (
                              <span className="text-amber-400 text-[9px]">🔒</span>
                            ) : (
                              <span className="text-[9px] text-[var(--color-text-secondary)]">({m.rank})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Roles Needed */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-[var(--color-text-secondary)]">Recherche :</span>
                      <div className="flex flex-wrap gap-1">
                        {lobby.roleNeeded.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    {lobby.note && (
                      <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-background)]/60 p-2.5 rounded-xl border border-[var(--color-border)] italic line-clamp-2">
                        &ldquo;{lobby.note}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* JOIN BUTTON */}
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <button
                      onClick={() => handleJoinLobby(lobby)}
                      className="w-full py-2.5 rounded-xl bg-[var(--color-val-red)] hover:bg-[#ff5e6c] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Rejoindre le Salon</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 4 : SALON EN TEMPS RÉEL (SPLIT VIEW COUPÉE EN DEUX)                   */}
      {/* ========================================================================= */}
      {currentView === "salon" && activeLobby && (
        <div className="space-y-4 animate-in zoom-in-95 duration-300">
          {/* Top Bar Salon */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-val-red)]/15 border border-[var(--color-val-red)]/40 flex items-center justify-center text-lg">
                👥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white uppercase">
                    Salon de {activeLobby.leaderName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-val-red)] text-white text-[10px] font-black uppercase">
                    {activeLobby.mode}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Niveau estimé : <strong className="text-white">{activeLobby.lobbyLevel}</strong> • {activeLobby.members?.length}/{activeLobby.maxSlots} Joueurs
                </p>
              </div>
            </div>

            <button
              onClick={handleLeaveSalon}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-200 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Quitter le salon ✕
            </button>
          </div>

          {/* SPLIT VIEW (50% GAUCHE MEMBRES & VOCAL / 50% DROITE CHAT SÉCURISÉ) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
            {/* ==================== GAUCHE : MEMBRES DU GROUPE & VOCAL (5 cols) ==================== */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 border border-[var(--color-border)] flex flex-col justify-between gap-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <span className="text-xs font-black uppercase text-[var(--color-text-secondary)] tracking-wider">
                    Membres du Groupe ({activeLobby.members?.length}/{activeLobby.maxSlots})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      🟢 En ligne
                    </span>
                  </div>
                </div>

                {/* Members list with animated speaking contour */}
                <div className="space-y-3">
                  {activeLobby.members?.map((member) => {
                    const isMe = member.gameName.toLowerCase() === myName.toLowerCase() && member.tagLine.toLowerCase() === myTag.toLowerCase();
                    const voiceInfo = activeLobby.voiceMembers?.find(
                      (v) => v.gameName.toLowerCase() === member.gameName.toLowerCase() && v.tagLine.toLowerCase() === member.tagLine.toLowerCase()
                    );
                    const isUserInVoice = !!voiceInfo || (isMe && isInVoice);
                    const isUserSpeaking = (isMe && isMyVoiceSpeaking) || (voiceInfo?.isSpeaking && !voiceInfo?.isMuted);

                    return (
                      <div
                        key={member.id}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 shadow-md ${
                          isUserSpeaking
                            ? "bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-[1.02]"
                            : "bg-[var(--color-background)]/80 border-[var(--color-border)]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.gameName}
                                className={`w-10 h-10 rounded-xl object-cover border flex-shrink-0 transition-all ${
                                  isUserSpeaking ? "border-emerald-400 ring-2 ring-emerald-400" : "border-white/20"
                                }`}
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-xl bg-[var(--color-surface)] border flex items-center justify-center text-white font-black text-sm flex-shrink-0 transition-all ${
                                  isUserSpeaking ? "border-emerald-400 ring-2 ring-emerald-400" : "border-white/20"
                                }`}
                              >
                                {member.gameName[0]?.toUpperCase()}
                              </div>
                            )}

                            {isUserInVoice && (
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-black ${
                                  isUserSpeaking ? "bg-emerald-400 text-black animate-bounce" : "bg-emerald-600 text-white"
                                }`}
                                title={isUserSpeaking ? "En train de parler" : "Connecté en vocal"}
                              >
                                {isUserSpeaking ? "🔊" : "🎙️"}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-black truncate ${isUserSpeaking ? "text-emerald-300" : "text-white"}`}>
                                {member.gameName}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-secondary)]">#{member.tagLine}</span>
                              {member.isLeader && <span title="Chef de groupe">👑</span>}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              {member.isPrivateRank ? (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  🔒 Rang Privé
                                </span>
                              ) : (
                                <>
                                  {member.rankUrl && <img src={member.rankUrl} alt={member.rank} className="w-3.5 h-3.5 object-contain" />}
                                  <span className="text-[10px] font-bold text-[var(--color-val-light)] uppercase">{member.rank}</span>
                                </>
                              )}

                              {isUserSpeaking && (
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider animate-pulse ml-1">
                                  • Parle
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions for member */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyRiotId(`${member.gameName}#${member.tagLine}`)}
                            title="Copier le Riot ID"
                            className="p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-val-red)] border border-[var(--color-border)] text-white text-xs transition-all cursor-pointer"
                          >
                            {copiedId === `${member.gameName}#${member.tagLine}` ? "✓" : "📋"}
                          </button>
                          {onSelectPlayer && (
                            <button
                              onClick={() => onSelectPlayer(`${member.gameName}#${member.tagLine}`)}
                              title="Voir profil Spycam"
                              className="p-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white text-xs transition-all cursor-pointer"
                            >
                              👁️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Slot placeholders */}
                  {Array.from({ length: Math.max(0, activeLobby.maxSlots - (activeLobby.members?.length || 0)) }).map((_, i) => (
                    <div
                      key={`empty_${i}`}
                      className="p-3.5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center gap-2 text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-wider opacity-60"
                    >
                      <span>➕</span>
                      <span>En attente d&apos;un joueur...</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VOCAL CONTROL SYSTEM (DÉCROCHER / RACCROCHER & COMMANDES) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0f1923] via-[#15202b] to-[#0f1923] border border-[var(--color-border)] space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isInVoice ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">Canal Vocal Sécurisé</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isInVoice ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>
                    {isInVoice ? `En Ligne (${activeLobby.voiceMembers?.length || 1})` : "Déconnecté"}
                  </span>
                </div>

                {voiceError && (
                  <div className="p-2 rounded-lg bg-red-500/20 border border-red-500 text-red-200 text-[10px] font-bold">
                    {voiceError}
                  </div>
                )}

                {/* SI NON CONNECTÉ AU VOCAL : BOUTON DÉCROCHER 📞 */}
                {!isInVoice ? (
                  <button
                    onClick={handleJoinVoice}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span className="text-base">📞</span>
                    <span>Décrocher • Rejoindre le Vocal</span>
                  </button>
                ) : (
                  /* SI CONNECTÉ AU VOCAL : EQUALIZER & COMMANDES & RACCROCHER 🔴 */
                  <div className="space-y-3">
                    {/* Live Voice Visualizer */}
                    <div className="flex items-center justify-center gap-1.5 h-6 py-1 bg-black/30 rounded-xl px-2">
                      {[30, 75, 40, 95, 60, 100, 50, 85, 30, 70, 45, 90, 35].map((h, i) => (
                        <div
                          key={i}
                          style={{
                            height: isMicMuted ? "4px" : `${Math.max(4, Math.min(100, h * (isMyVoiceSpeaking ? Math.max(0.6, voiceVolumeLevel * 2.5) : 0.15)))}%`,
                          }}
                          className={`w-1 rounded-full transition-all duration-100 ${
                            isMyVoiceSpeaking ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-gray-600"
                          }`}
                        ></div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          const nextMute = !isMicMuted;
                          setIsMicMuted(nextMute);
                          voiceManagerRef.current?.setMute(nextMute);
                          syncVoiceStateToBackend(false, nextMute);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isMicMuted
                            ? "bg-red-500/20 border-red-500 text-red-300 shadow-md"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        <span>{isMicMuted ? "🔇" : "🎙️"}</span>
                        <span>{isMicMuted ? "Micro Coupé" : "Micro Actif"}</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          setIsDeafened(!isDeafened);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isDeafened
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        <span>{isDeafened ? "🔕" : "🎧"}</span>
                        <span>{isDeafened ? "Casque Coupé" : "Écoute"}</span>
                      </button>
                    </div>

                    {/* BOUTON RACCROCHER 🔴 */}
                    <button
                      onClick={handleLeaveVoice}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>🔴</span>
                      <span>Raccrocher • Quitter le Vocal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ==================== DROITE : CHAT TEXTUEL MODÉRÉ & JOURNAL (7 cols) ==================== */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 border border-[var(--color-border)] flex flex-col justify-between gap-4 shadow-xl">
              <div className="space-y-2 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="text-xs font-black uppercase text-white tracking-wider">
                      Discussion du Salon
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Filtre Anti-Toxicité Actif</span>
                  </span>
                </div>

                <div className="text-[10px] text-[var(--color-text-secondary)] opacity-80 flex items-center justify-between">
                  <span>Les insultes sont masquées automatiquement • Logs conservés 7j</span>
                  <span>🔒 Chiffré</span>
                </div>
              </div>

              {moderationWarning && (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold text-center animate-in slide-in-from-top-2">
                  ⚠️ {moderationWarning}
                </div>
              )}

              {/* Messages Flow */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-2 custom-scrollbar">
                {activeLobby.chat?.length === 0 ? (
                  <div className="text-center py-16 text-[var(--color-text-secondary)] text-xs">
                    Aucun message pour l&apos;instant. Dites bonjour à vos coéquipiers !
                  </div>
                ) : (
                  activeLobby.chat?.map((msg) => {
                    const isMe = msg.senderName.toLowerCase() === myName.toLowerCase();
                    const isSystem = msg.senderName === "Système";

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="text-[10px] font-bold text-[var(--color-val-red)] bg-[var(--color-val-red)]/10 px-3 py-1 rounded-full border border-[var(--color-val-red)]/20 inline-block">
                            📢 {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-black text-white">{msg.senderName}</span>
                          <span className="text-[9px] text-[var(--color-text-secondary)]">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {msg.isToxic && (
                            <span className="text-[8px] bg-red-500/20 text-red-300 px-1 rounded border border-red-500/30">
                              Modéré
                            </span>
                          )}
                        </div>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            isMe
                              ? "bg-[var(--color-val-red)] text-white rounded-tr-none shadow-md shadow-[rgba(255,70,85,0.2)]"
                              : "bg-[var(--color-surface-hover)] text-white rounded-tl-none border border-[var(--color-border)]"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Écrire un message au groupe (modéré en direct)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-val-red)]"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-val-red)] hover:bg-[#ff5e6c] text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
