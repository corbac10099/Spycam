import { NextRequest, NextResponse } from 'next/server';

export interface LobbyMember {
  id: string;
  gameName: string;
  tagLine: string;
  rank: string;
  rankUrl?: string;
  rankTier?: number;
  isPrivateRank?: boolean;
  roles: string[];
  isLeader?: boolean;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderTag: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
}

export interface LobbyItem {
  id: string;
  leaderName: string;
  leaderTag: string;
  leaderRank: string;
  leaderRankUrl?: string;
  leaderRankTier: number;
  isLeaderPrivate: boolean;
  leaderAvatar?: string;
  members: LobbyMember[];
  mode: string;
  roleNeeded: string[];
  micRequired: 'yes' | 'no' | 'optional';
  maxSlots: number;
  currentSlots: number;
  note: string;
  createdAt: number;
  region: string;
  lobbyLevel: string;
  lobbyLevelTier: number;
  chat: ChatMessage[];
}

// Convert rankTier (3..27) to readable label
export function getTierName(avgTier: number): string {
  if (avgTier <= 5) return 'Fer';
  if (avgTier <= 8) return 'Bronze';
  if (avgTier <= 11) return 'Argent';
  if (avgTier <= 14) return 'Or';
  if (avgTier <= 17) return 'Platine';
  if (avgTier <= 20) return 'Diamant';
  if (avgTier <= 23) return 'Ascendant';
  if (avgTier <= 26) return 'Immortel';
  return 'Radiant';
}

// Global in-memory storage for active lobbies
declare global {
  // eslint-disable-next-line no-var
  var _spycam_lobbies: LobbyItem[] | undefined;
}

if (!global._spycam_lobbies) {
  global._spycam_lobbies = [
    {
      id: 'lobby_demo_1',
      leaderName: 'Shadow',
      leaderTag: 'BETA',
      leaderRank: 'Ascendant 2',
      leaderRankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png',
      leaderRankTier: 22,
      isLeaderPrivate: false,
      leaderAvatar: 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png',
      members: [
        {
          id: 'mem_1',
          gameName: 'Shadow',
          tagLine: 'BETA',
          rank: 'Ascendant 2',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png',
          rankTier: 22,
          isPrivateRank: false,
          roles: ['Duelliste', 'Initiateur'],
          isLeader: true,
          avatarUrl: 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png',
        },
        {
          id: 'mem_2',
          gameName: 'ViperMain',
          tagLine: 'FR1',
          rank: 'Diamant 3',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/largeicon.png',
          rankTier: 20,
          isPrivateRank: false,
          roles: ['Contrôleur'],
          isLeader: false,
        },
      ],
      mode: 'Compétitif',
      roleNeeded: ['Initiateur', 'Sentinelle'],
      micRequired: 'yes',
      maxSlots: 5,
      currentSlots: 2,
      note: 'Duo cherche bon Initiateur et Sentinelle pour push Ascendant / Immortel ce soir ! Vocal Discord / Spycam.',
      createdAt: Date.now() - 1000 * 60 * 15,
      region: 'EU / Paris',
      lobbyLevel: 'Ascendant 1',
      lobbyLevelTier: 21,
      chat: [
        {
          id: 'msg_1',
          senderName: 'Shadow',
          senderTag: 'BETA',
          content: 'Bienvenue dans le salon ! On part dès qu’on est au moins 4.',
          timestamp: Date.now() - 1000 * 60 * 14,
        },
      ],
    },
    {
      id: 'lobby_demo_2',
      leaderName: 'Kyojin',
      leaderTag: '0001',
      leaderRank: 'Platine 2',
      leaderRankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png',
      leaderRankTier: 16,
      isLeaderPrivate: false,
      members: [
        {
          id: 'mem_3',
          gameName: 'Kyojin',
          tagLine: '0001',
          rank: 'Platine 2',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png',
          rankTier: 16,
          isPrivateRank: false,
          roles: ['Duelliste'],
          isLeader: true,
        },
        {
          id: 'mem_4',
          gameName: 'Ghosty',
          tagLine: 'EUW',
          rank: 'Privé',
          isPrivateRank: true,
          roles: ['Contrôleur', 'Sentinelle'],
          isLeader: false,
        },
      ],
      mode: 'Compétitif',
      roleNeeded: ['Duelliste', 'Initiateur'],
      micRequired: 'yes',
      maxSlots: 5,
      currentSlots: 2,
      note: 'Recherche joueurs réguliers Platine / Diamant.',
      createdAt: Date.now() - 1000 * 60 * 35,
      region: 'EU / Frankfurt',
      lobbyLevel: 'Platine 2',
      lobbyLevelTier: 16,
      chat: [],
    },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const role = searchParams.get('role');
  const minTier = searchParams.get('minTier') ? parseInt(searchParams.get('minTier')!) : null;
  const maxTier = searchParams.get('maxTier') ? parseInt(searchParams.get('maxTier')!) : null;

  // Clean lobbies older than 4 hours
  const fourHoursAgo = Date.now() - 1000 * 60 * 60 * 4;
  global._spycam_lobbies = (global._spycam_lobbies || []).filter((l) => l.createdAt > fourHoursAgo);

  let filtered = [...global._spycam_lobbies];

  if (mode && mode !== 'all') {
    filtered = filtered.filter((l) => l.mode === mode);
  }

  if (role && role !== 'all') {
    filtered = filtered.filter((l) => l.roleNeeded.includes(role) || l.roleNeeded.includes('Tous Rôles'));
  }

  if (minTier !== null && maxTier !== null) {
    filtered = filtered.filter((l) => l.lobbyLevelTier >= minTier - 4 && l.lobbyLevelTier <= maxTier + 4);
  }

  return NextResponse.json({
    success: true,
    lobbies: filtered.sort((a, b) => b.createdAt - a.createdAt),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leaderName,
      leaderTag,
      leaderRank,
      leaderRankUrl,
      leaderRankTier = 12,
      isLeaderPrivate = false,
      leaderAvatar,
      members = [],
      mode = 'Compétitif',
      roleNeeded = ['Tous Rôles'],
      micRequired = 'yes',
      maxSlots = 5,
      note = '',
      region = 'EU / Paris',
    } = body;

    if (!leaderName || !leaderTag) {
      return NextResponse.json({ success: false, error: 'Pseudo et Tag requis' }, { status: 400 });
    }

    if (isLeaderPrivate) {
      return NextResponse.json(
        { success: false, error: 'Votre profil doit être public pour créer un salon.' },
        { status: 403 }
      );
    }

    // Build complete member list starting with leader
    const fullMembers: LobbyMember[] = [
      {
        id: `mem_${Date.now()}_0`,
        gameName: leaderName,
        tagLine: leaderTag,
        rank: leaderRank || 'Non-classé',
        rankUrl: leaderRankUrl || '',
        rankTier: leaderRankTier,
        isPrivateRank: false,
        roles: body.leaderRoles || ['Tous Rôles'],
        isLeader: true,
        avatarUrl: leaderAvatar,
      },
      ...members.map((m: any, idx: number) => ({
        id: `mem_${Date.now()}_${idx + 1}`,
        gameName: m.gameName,
        tagLine: m.tagLine,
        rank: m.isPrivateRank ? 'Privé' : m.rank || 'Non-classé',
        rankUrl: m.isPrivateRank ? '' : m.rankUrl || '',
        rankTier: m.rankTier ?? 12,
        isPrivateRank: !!m.isPrivateRank,
        roles: m.roles || ['Tous Rôles'],
        isLeader: false,
        avatarUrl: m.avatarUrl,
      })),
    ];

    // Compute average lobby rank tier
    const knownTiers = fullMembers.filter((m) => !m.isPrivateRank && m.rankTier && m.rankTier > 0).map((m) => m.rankTier!);
    const avgTier = knownTiers.length > 0 ? Math.round(knownTiers.reduce((a, b) => a + b, 0) / knownTiers.length) : leaderRankTier || 12;
    const lobbyLevel = getTierName(avgTier);

    const newLobby: LobbyItem = {
      id: `lobby_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      leaderName,
      leaderTag,
      leaderRank: leaderRank || 'Non-classé',
      leaderRankUrl: leaderRankUrl || '',
      leaderRankTier: leaderRankTier || 12,
      isLeaderPrivate: false,
      leaderAvatar: leaderAvatar || '',
      members: fullMembers,
      mode,
      roleNeeded: Array.isArray(roleNeeded) && roleNeeded.length > 0 ? roleNeeded : ['Tous Rôles'],
      micRequired,
      maxSlots: Number(maxSlots) || 5,
      currentSlots: fullMembers.length,
      note: note || 'Recherche coéquipiers pour session ranked !',
      createdAt: Date.now(),
      region,
      lobbyLevel,
      lobbyLevelTier: avgTier,
      chat: [
        {
          id: `msg_${Date.now()}`,
          senderName: 'Système',
          senderTag: 'SPYCAM',
          content: `Salon créé par ${leaderName}#${leaderTag} • Niveau estimé : ${lobbyLevel}`,
          timestamp: Date.now(),
        },
      ],
    };

    if (!global._spycam_lobbies) global._spycam_lobbies = [];
    global._spycam_lobbies.unshift(newLobby);

    return NextResponse.json({
      success: true,
      lobby: newLobby,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
