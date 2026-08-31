import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const pathname = url.pathname;

  // Ignorer les fichiers statiques et les routes API internes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Sous-domaine Spycam détecté (ex: spycam.sgs.gg, spycam.sgs-tan.vercel.app, spycam.localhost:3000)
  if (host.startsWith("spycam.")) {
    // Si l'utilisateur est sur le sous-domaine spycam et demande la racine, servir le tracker
    if (pathname === "/sgs") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Domaine Principal SGS détecté (ex: sgs.gg, sgs-tan.vercel.app, sgs.localhost:3000)
  // Si le domaine commence par sgs. ou est le domaine racine configuré
  const isSgsHost = host.startsWith("sgs.") || host.includes("sgs-");

  if (isSgsHost && pathname === "/") {
    // Réécrire la page d'accueil vers le Hub SGS sans changer l'URL du navigateur
    url.pathname = "/sgs";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
