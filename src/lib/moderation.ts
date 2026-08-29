// Spycam In-Game & Lobby Chat Auto-Moderation Engine
// Filters offensive, toxic, hateful, and harassing language in FR and EN

const TOXIC_PATTERNS: RegExp[] = [
  // French offensive terms and variants (with leetspeak / spaces bypass checks)
  /\b(connard|connasse|con|salope|salop|pute|putain|fdp|fils de pute|ntm|nique ta mere|ta gueule|tg|batard|encule|enculer|pedale|tapette|merde|chienne|abruti|creve|suicide toi)\b/gi,
  /\b(f+d+p+|n+t+m+|t+g+|b+t+r+d+)\b/gi,
  /\bc[o0]nn?a[r|d]+\b/gi,
  /\bs[a4]l[o0]p[e3]?\b/gi,
  /\b[e3]nc[uü0]l[e3é]?\b/gi,
  /\bp[uü]t[e3a4]in?\b/gi,
  /\bn[i1]qu[e3]\b/gi,

  // English toxic / offensive terms & slurs
  /\b(fuck|fucker|fucking|bitch|asshole|bastard|cunt|dick|retard|faggot|nigger|nigga|kys|kill yourself|stfu|noob|trash|uninstall|shit|motherfucker)\b/gi,
  /\bf+u+c+k+\b/gi,
  /\bb+i+t+c+h+\b/gi,
  /\ba+s+s+h+o+l+e+\b/gi,
  /\bk+y+s+\b/gi,
  /\bs+t+f+u+\b/gi,
  /\br+e+t+a+r+d+\b/gi,
];

export interface ModerationResult {
  cleanText: string;
  isToxic: boolean;
  censoredCount: number;
}

/**
 * Filters out toxic and offensive language by replacing blacklisted words with asterisks.
 */
export function filterToxicText(input: string): ModerationResult {
  if (!input || typeof input !== "string") {
    return { cleanText: "", isToxic: false, censoredCount: 0 };
  }

  let clean = input;
  let matchesCount = 0;

  for (const pattern of TOXIC_PATTERNS) {
    clean = clean.replace(pattern, (match) => {
      matchesCount++;
      return "*".repeat(Math.max(3, match.length));
    });
  }

  return {
    cleanText: clean,
    isToxic: matchesCount > 0,
    censoredCount: matchesCount,
  };
}

/**
 * Check if text contains high-severity violations (hate speech, self-harm incitement)
 */
export function isSevereViolation(input: string): boolean {
  if (!input) return false;
  const severeRegex = /\b(kys|kill yourself|suicide toi|creve|nigger|faggot)\b/i;
  return severeRegex.test(input);
}
