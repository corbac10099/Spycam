import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.RIOT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  
  if (!clientId || clientId === 'votre_client_id_ici') {
    return NextResponse.json({ error: "Le Client ID RSO n'est pas configuré dans le fichier .env.local" }, { status: 500 });
  }

  // L'URL d'autorisation officielle de Riot (RSO)
  const authUrl = new URL('https://auth.riotgames.com/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid offline_access');
  // En production, vous devriez aussi ajouter un state généré aléatoirement pour la sécurité (CSRF)
  authUrl.searchParams.append('state', 'random_state_value_for_security');

  return NextResponse.redirect(authUrl.toString());
}
