import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code_provided`);
  }

  const clientId = process.env.RIOT_CLIENT_ID;
  const clientSecret = process.env.RIOT_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=missing_credentials`);
  }

  try {
    // Échange du code contre un access token
    const tokenResponse = await fetch('https://auth.riotgames.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    });

    if (!tokenResponse.ok) {
      console.error("Erreur lors de l'échange de token Riot:", await tokenResponse.text());
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Stocker le token dans un cookie HttpOnly sécurisé
    const cookieStore = await cookies();
    cookieStore.set('riot_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in || 3600 // Expiration fournie par Riot ou 1h par défaut
    });

    // Optionnel: Stocker le refresh token
    if (refreshToken) {
      cookieStore.set('riot_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 jours
      });
    }

    // Rediriger l'utilisateur vers la page d'accueil connecté
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?loggedIn=true`);
    
  } catch (error) {
    console.error("Erreur Callback RSO:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=internal_error`);
  }
}
