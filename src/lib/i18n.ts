// ==================== Système de Traduction i18n ====================
// Fichier centralisé contenant toutes les traductions de l\'interface utilisateur.

export type Locale = 'fr' | 'en' | 'es' | 'de' | 'pt' | 'it' | 'ja' | 'ko';

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

type TranslationKeys = {
  // === Navigation ===
  nav_home: string;
  nav_news: string;
  nav_agents: string;
  nav_settings: string;
  nav_logout: string;
  nav_back_profile: string;
  nav_search_placeholder: string;

  // === Profile tabs ===
  tab_performance: string;
  tab_agents: string;
  tab_history: string;

  // === Stats labels ===
  stat_kills: string;
  stat_deaths: string;
  stat_kd: string;
  stat_hs: string;
  stat_winrate: string;
  stat_acs: string;
  stat_adr: string;
  stat_kast: string;
  stat_wins: string;
  stat_matches: string;
  stat_fb: string;
  stat_damage: string;
  stat_assists: string;
  stat_ace: string;

  // === Match history ===
  match_load_more: string;
  match_victory: string;
  match_defeat: string;
  match_draw: string;
  match_all_seasons: string;
  match_all_modes: string;
  match_ranked: string;
  match_unrated: string;
  match_other: string;
  match_overview: string;
  match_scoreboard: string;
  match_timeline: string;
  match_duels: string;
  match_round: string;
  match_rounds: string;

  // === Agent stats ===
  agent_playtime: string;
  agent_games: string;
  agent_best_agent: string;

  // === Settings ===
  settings_title: string;
  settings_features: string;
  settings_privacy: string;
  settings_appearance: string;
  settings_about: string;
  settings_language: string;
  settings_save: string;
  settings_saving: string;
  settings_saved: string;

  // Settings - Features
  settings_smart_rating: string;
  settings_smart_rating_desc: string;
  settings_video_loop: string;
  settings_video_loop_desc: string;
  settings_loop_delay: string;

  // Settings - Privacy
  settings_public_profile: string;
  settings_public_profile_desc: string;
  settings_hidden_stats: string;
  settings_hidden_stats_desc: string;
  settings_enforce_visitors: string;
  settings_enforce_visitors_desc: string;

  // Settings - Appearance
  settings_theme: string;
  settings_theme_dark: string;
  settings_theme_light: string;
  settings_theme_custom: string;
  settings_banner: string;
  settings_banner_url: string;
  settings_banner_offset: string;
  settings_banner_catalog: string;

  // Settings - About
  settings_about_title: string;
  settings_about_version: string;
  settings_about_dev: string;
  settings_about_desc: string;

  // Settings - Language
  settings_language_title: string;
  settings_language_desc: string;

  // === Agents Wiki ===
  wiki_back: string;
  wiki_description: string;
  wiki_video: string;
  wiki_learn_more: string;
  wiki_loading: string;
  wiki_no_agents: string;

  // === News ===
  news_title: string;
  news_loading: string;
  news_empty: string;

  // === Errors & Status ===
  error_server: string;
  error_private_profile: string;
  loading_text: string;
  loading_search: string;

  // === Misc ===
  favorites: string;
  add_favorite: string;
  remove_favorite: string;
  debug_generate: string;
  back_to_agents: string;
  search_button: string;
  search_placeholder: string;
  no_agents_configured: string;
  loading_agents: string;
  global_stats: string;
  recent_matches: string;
  no_matches_found: string;
  manage_profile: string;
  logout: string;
  open_tracker_gg: string;
  copy_profile_link: string;
  link_copied: string;
  search_prompt: string;
  no_player_selected: string;

  // === New Keys ===
  news_filter_all: string;
  news_filter_updates: string;
  news_filter_esports: string;
  news_filter_community: string;
  match_filter_all: string;
  match_filter_competitive: string;
  match_filter_unrated: string;
  match_filter_other: string;
  smart_rating: string;
  visual_indicators_desc: string;
  video_loop: string;
  video_loop_desc: string;
  video_delay: string;
  back_to_profile: string;
  save_settings: string;
  cancel: string;
  profile_privacy: string;
  profile_privacy_desc: string;
  public_profile: string;
  public_profile_desc: string;
  private_profile: string;
  private_profile_desc: string;
  stats_visibility: string;
  stats_visibility_desc: string;
  stat_dd: string;
  apply_to_visitors: string;
  apply_to_visitors_desc: string;
  ui_theme: string;
  ui_theme_desc: string;
  theme_dark: string;
  theme_light: string;
  theme_midnight: string;
  theme_crimson: string;
  theme_ocean: string;
  theme_custom: string;
  color_customization: string;
  accent_color: string;
  bg_color: string;
  banner_customization: string;
  banner_default: string;
  see_more: string;
  vertical_crop: string;
  preview: string;
  avatar: string;
  live_preview: string;
  live_preview_desc: string;
  footer_desc: string;
  footer_legal: string;
  role_duelist: string;
  role_initiator: string;
  role_controller: string;
  role_sentinel: string;
  logout_button: string;
};

const translations: Record<Locale, TranslationKeys> = {
  // ==================== FRANÇAIS ====================
  fr: {
    nav_home: 'Accueil',
    nav_news: 'Actualités',
    nav_agents: 'Wiki Agents',
    nav_settings: 'Paramètres',
    nav_logout: 'Déconnexion',
    nav_back_profile: 'Retour à mon profil',
    nav_search_placeholder: 'Rechercher Pseudo#Tag',

    tab_performance: 'Performances',
    tab_agents: 'Agents',
    tab_history: 'Historique',

    stat_kills: 'Kills',
    stat_deaths: 'Morts',
    stat_kd: 'K/D Ratio',
    stat_hs: 'Headshot %',
    stat_winrate: 'Win Rate',
    stat_acs: 'ACS Moyen',
    stat_adr: 'Dégâts/Tour (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Victoires',
    stat_matches: 'Parties',
    stat_fb: 'Premiers sangs',
    stat_damage: 'Dégâts',
    stat_assists: 'Assists',
    stat_ace: 'ACE',

    match_load_more: 'Charger plus (+10)',
    match_victory: 'VICTOIRE',
    match_defeat: 'DÉFAITE',
    match_draw: 'ÉGALITÉ',
    match_all_seasons: 'Toutes les Saisons',
    match_all_modes: 'Tout',
    match_ranked: 'Classé',
    match_unrated: 'Non Classé',
    match_other: 'Autres',
    match_overview: 'Vue d\'ensemble',
    match_scoreboard: 'Tableau',
    match_timeline: 'Timeline',
    match_duels: 'Duels',
    match_round: 'Round',
    match_rounds: 'Rounds',

    agent_playtime: 'Temps de jeu',
    agent_games: 'parties',
    agent_best_agent: 'Agent Principal',

    settings_title: 'Paramètres',
    settings_features: 'Fonctionnalités',
    settings_privacy: 'Confidentialité',
    settings_appearance: 'Apparence',
    settings_about: 'À propos',
    settings_language: 'Langue',
    settings_save: 'Enregistrer',
    settings_saving: 'Enregistrement...',
    settings_saved: 'Enregistré !',

    settings_smart_rating: 'Notation Intelligente',
    settings_smart_rating_desc: 'Affiche des indicateurs visuels sur les stats en dessous de la moyenne.',
    settings_video_loop: 'Lecture vidéo en boucle',
    settings_video_loop_desc: 'Rejoue automatiquement les vidéos des compétences d\'agents.',
    settings_loop_delay: 'Délai avant répétition',

    settings_public_profile: 'Profil public',
    settings_public_profile_desc: 'Les autres utilisateurs pourront chercher et voir votre profil.',
    settings_hidden_stats: 'Statistiques masquées',
    settings_hidden_stats_desc: 'Sélectionnez les statistiques à masquer sur votre profil.',
    settings_enforce_visitors: 'Appliquer aux visiteurs',
    settings_enforce_visitors_desc: 'Les visiteurs de votre profil verront uniquement les statistiques que vous voyez.',

    settings_theme: 'Thème',
    settings_theme_dark: 'Sombre',
    settings_theme_light: 'Clair',
    settings_theme_custom: 'Personnalisé',
    settings_banner: 'Bannière de profil',
    settings_banner_url: 'URL de la bannière',
    settings_banner_offset: 'Position verticale',
    settings_banner_catalog: 'Catalogue de bannières',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Version',
    settings_about_dev: 'Développé par',
    settings_about_desc: 'Un tracker de performances Valorant premium avec des fonctionnalités avancées.',

    settings_language_title: 'Langue de l\'interface',
    settings_language_desc: 'Choisissez la langue dans laquelle l\'interface sera affichée.',

    wiki_back: 'Retour',
    wiki_description: 'Description',
    wiki_video: 'Vidéo',
    wiki_learn_more: 'En savoir plus',
    wiki_loading: 'Chargement des agents...',
    wiki_no_agents: 'Aucun agent trouvé.',

    news_title: 'ACTUALITÉS',
    news_loading: 'Chargement des actualités...',
    news_empty: 'Aucune actualité pour le moment.',

    error_server: 'Serveur inaccessible.',
    error_private_profile: 'Ce profil est privé.',
    loading_text: 'Chargement...',
    loading_search: 'Recherche en cours...',

    favorites: 'Favoris',
    debug_generate: 'Générer données debug',
    back_to_agents: 'Retour aux agents',
    search_button: 'Rechercher',
    search_placeholder: 'Rechercher un joueur (ex: Pseudo#Tag)',
    no_agents_configured: 'Aucun agent configuré',
    loading_agents: 'Chargement des agents...',
    global_stats: 'Statistiques globales',
    recent_matches: 'Parties récentes',
    no_matches_found: 'Aucun match trouvé.',
    manage_profile: 'Gérer le profil',
    logout: 'Se Déconnecter',
    open_tracker_gg: 'Ouvrir Tracker.gg',
    copy_profile_link: 'Copier le lien du profil',
    link_copied: 'Lien copié !',
    search_prompt: 'Rechercher un joueur pour voir ses stats',
    no_player_selected: 'Aucun joueur sélectionné.',
    news_filter_all: 'Tout',
    news_filter_updates: 'Mises à jour',
    news_filter_esports: 'Esports',
    news_filter_community: 'Communauté',
    match_filter_all: 'Tout',
    match_filter_competitive: 'Classé',
    match_filter_unrated: 'Non Classé',
    match_filter_other: 'Autres',
    smart_rating: 'Notation Intelligente',
    visual_indicators_desc: 'Affiche des indicateurs visuels sur les stats en dessous de la moyenne.',
    video_loop: 'Lecture vidéo en boucle',
    video_loop_desc: 'Rejoue automatiquement les vidéos des compétences d\'agents.',
    video_delay: 'Délai avant répétition',
    back_to_profile: 'Retour au profil',
    save_settings: 'Sauvegarder',
    cancel: 'Annuler',
    profile_privacy: 'Confidentialité du profil',
    profile_privacy_desc: 'Gérez la visibilité de votre profil et de vos statistiques par les autres utilisateurs.',
    public_profile: 'Profil Public',
    public_profile_desc: 'Votre profil et vos statistiques sont visibles par n\'importe quel utilisateur qui recherche votre nom.',
    private_profile: 'Profil Privé',
    private_profile_desc: 'Seul vous pouvez consulter vos statistiques lorsque vous êtes connecté. Les autres utilisateurs verront un message indiquant que votre profil est privé.',
    stats_visibility: 'Visibilité des Statistiques',
    stats_visibility_desc: 'Décochez les statistiques que vous ne souhaitez pas voir sur votre propre profil.',
    stat_dd: 'DDΔ / Round',
    apply_to_visitors: 'Appliquer aux visiteurs',
    apply_to_visitors_desc: 'Si coché, les visiteurs verront exactement les mêmes stats que vous.',
    ui_theme: 'Thème de l\'interface',
    ui_theme_desc: 'Choisissez un thème visuel pour l\'application.',
    theme_dark: 'Sombre',
    theme_light: 'Clair',
    theme_midnight: 'Midnight',
    theme_crimson: 'Crimson',
    theme_ocean: 'Océan',
    theme_custom: 'Personnalisé',
    color_customization: 'Personnalisation des couleurs',
    accent_color: 'Couleur d\'accentuation',
    bg_color: 'Couleur de fond',
    banner_customization: 'Personnalisation de la Bannière',
    banner_default: 'Défaut',
    see_more: 'Voir plus',
    vertical_crop: 'Cadrage vertical (Hauteur)',
    preview: 'Aperçu',
    avatar: 'Avatar',
    live_preview: 'Aperçu en direct',
    live_preview_desc: 'Glissez le curseur pour voir l\'image s\'ajuster en temps réel dans le cadre ci-dessus.',
    footer_desc: 'Application de suivi de performances pour Valorant. Utilise l\'API officielle de Riot Games.',
    footer_legal: 'Spycam n\'est pas affilié à Riot Games et ne reflète pas les opinions de Riot Games ni de toute personne impliquée dans la production ou la gestion des propriétés de Riot Games. Riot Games et toutes les propriétés associées sont des marques commerciales ou des marques déposées de Riot Games, Inc.',
    role_duelist: 'Duelliste',
    role_initiator: 'Initiateur',
    role_controller: 'Contrôleur',
    role_sentinel: 'Sentinelle',
    logout_button: 'Déconnexion',
    add_favorite: 'Ajouter aux favoris',
    remove_favorite: 'Retirer des favoris',
  },

  // ==================== ENGLISH ====================
  en: {
    nav_home: 'Home',
    nav_news: 'News',
    nav_agents: 'Agents Wiki',
    nav_settings: 'Settings',
    nav_logout: 'Log out',
    nav_back_profile: 'Back to my profile',
    nav_search_placeholder: 'Search Username#Tag',

    tab_performance: 'Performance',
    tab_agents: 'Agents',
    tab_history: 'History',

    stat_kills: 'Kills',
    stat_deaths: 'Deaths',
    stat_kd: 'K/D Ratio',
    stat_hs: 'Headshot %',
    stat_winrate: 'Win Rate',
    stat_acs: 'Avg ACS',
    stat_adr: 'Damage/Round (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Wins',
    stat_matches: 'Matches',
    stat_fb: 'First Bloods',
    stat_damage: 'Damage',
    stat_assists: 'Assists',
    stat_ace: 'ACE',

    match_load_more: 'Load more (+10)',
    match_victory: 'VICTORY',
    match_defeat: 'DEFEAT',
    match_draw: 'DRAW',
    match_all_seasons: 'All Seasons',
    match_all_modes: 'All',
    match_ranked: 'Ranked',
    match_unrated: 'Unrated',
    match_other: 'Other',
    match_overview: 'Overview',
    match_scoreboard: 'Scoreboard',
    match_timeline: 'Timeline',
    match_duels: 'Duels',
    match_round: 'Round',
    match_rounds: 'Rounds',

    agent_playtime: 'Playtime',
    agent_games: 'games',
    agent_best_agent: 'Main Agent',

    settings_title: 'Settings',
    settings_features: 'Features',
    settings_privacy: 'Privacy',
    settings_appearance: 'Appearance',
    settings_about: 'About',
    settings_language: 'Language',
    settings_save: 'Save',
    settings_saving: 'Saving...',
    settings_saved: 'Saved!',

    settings_smart_rating: 'Smart Rating',
    settings_smart_rating_desc: 'Displays visual indicators on stats below average.',
    settings_video_loop: 'Video loop playback',
    settings_video_loop_desc: 'Automatically replays agent ability videos.',
    settings_loop_delay: 'Delay before replay',

    settings_public_profile: 'Public profile',
    settings_public_profile_desc: 'Other users can search and view your profile.',
    settings_hidden_stats: 'Hidden statistics',
    settings_hidden_stats_desc: 'Select the statistics to hide on your profile.',
    settings_enforce_visitors: 'Apply to visitors',
    settings_enforce_visitors_desc: 'Visitors will only see the statistics you see.',

    settings_theme: 'Theme',
    settings_theme_dark: 'Dark',
    settings_theme_light: 'Light',
    settings_theme_custom: 'Custom',
    settings_banner: 'Profile banner',
    settings_banner_url: 'Banner URL',
    settings_banner_offset: 'Vertical position',
    settings_banner_catalog: 'Banner catalog',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Version',
    settings_about_dev: 'Developed by',
    settings_about_desc: 'A premium Valorant performance tracker with advanced features.',

    settings_language_title: 'Interface language',
    settings_language_desc: 'Choose the language for the interface.',

    wiki_back: 'Back',
    wiki_description: 'Description',
    wiki_video: 'Video',
    wiki_learn_more: 'Learn more',
    wiki_loading: 'Loading agents...',
    wiki_no_agents: 'No agents found.',

    news_title: 'NEWS',
    news_loading: 'Loading news...',
    news_empty: 'No news at the moment.',

    error_server: 'Server unreachable.',
    error_private_profile: 'This profile is private.',
    loading_text: 'Loading...',
    loading_search: 'Searching...',

    favorites: 'Favorites',
    debug_generate: 'Generate debug data',
    back_to_agents: 'Back to agents',
    search_button: 'Search',
    search_placeholder: 'Search a player (e.g. Username#Tag)',
    no_agents_configured: 'No agents configured',
    loading_agents: 'Loading agents...',
    global_stats: 'Global statistics',
    recent_matches: 'Recent matches',
    no_matches_found: 'No match found.',
    manage_profile: 'Manage profile',
    logout: 'Log out',
    open_tracker_gg: 'Open Tracker.gg',
    copy_profile_link: 'Copy profile link',
    link_copied: 'Link copied!',
    search_prompt: 'Search a player to see their stats',
    no_player_selected: 'No player selected.',
    news_filter_all: 'All',
    news_filter_updates: 'Updates',
    news_filter_esports: 'Esports',
    news_filter_community: 'Community',
    match_filter_all: 'All',
    match_filter_competitive: 'Competitive',
    match_filter_unrated: 'Unrated',
    match_filter_other: 'Other',
    smart_rating: 'Smart Rating',
    visual_indicators_desc: 'Displays visual indicators on below-average stats.',
    video_loop: 'Video loop playback',
    video_loop_desc: 'Automatically replays agent ability videos.',
    video_delay: 'Replay delay',
    back_to_profile: 'Back to profile',
    save_settings: 'Save settings',
    cancel: 'Cancel',
    profile_privacy: 'Profile Privacy',
    profile_privacy_desc: 'Manage the visibility of your profile and stats to other users.',
    public_profile: 'Public Profile',
    public_profile_desc: 'Your profile and stats are visible to anyone who searches for your name.',
    private_profile: 'Private Profile',
    private_profile_desc: 'Only you can view your stats when logged in. Other users will see a message indicating your profile is private.',
    stats_visibility: 'Stats Visibility',
    stats_visibility_desc: 'Uncheck the stats you do not want to see on your own profile.',
    stat_dd: 'DDΔ / Round',
    apply_to_visitors: 'Apply to visitors',
    apply_to_visitors_desc: 'If checked, visitors will see exactly the same stats as you.',
    ui_theme: 'UI Theme',
    ui_theme_desc: 'Choose a visual theme for the application.',
    theme_dark: 'Dark',
    theme_light: 'Light',
    theme_midnight: 'Midnight',
    theme_crimson: 'Crimson',
    theme_ocean: 'Ocean',
    theme_custom: 'Custom',
    color_customization: 'Color Customization',
    accent_color: 'Accent Color',
    bg_color: 'Background Color',
    banner_customization: 'Banner Customization',
    banner_default: 'Default',
    see_more: 'See more',
    vertical_crop: 'Vertical Crop (Height)',
    preview: 'Preview',
    avatar: 'Avatar',
    live_preview: 'Live Preview',
    live_preview_desc: 'Drag the slider to see the image adjust in real-time in the frame above.',
    footer_desc: 'Performance tracking app for Valorant. Uses the official Riot Games API.',
    footer_legal: 'Spycam is not affiliated with Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.',
    role_duelist: 'Duelist',
    role_initiator: 'Initiator',
    role_controller: 'Controller',
    role_sentinel: 'Sentinel',
    logout_button: 'Logout',
    add_favorite: 'Add to favorites',
    remove_favorite: 'Remove from favorites',
  },

  // ==================== ESPAÑOL ====================
  es: {
    nav_home: 'Inicio',
    nav_news: 'Noticias',
    nav_agents: 'Wiki Agentes',
    nav_settings: 'Configuración',
    nav_logout: 'Cerrar sesión',
    nav_back_profile: 'Volver a mi perfil',
    nav_search_placeholder: 'Buscar Usuario#Tag',

    tab_performance: 'Rendimiento',
    tab_agents: 'Agentes',
    tab_history: 'Historial',

    stat_kills: 'Asesinatos',
    stat_deaths: 'Muertes',
    stat_kd: 'Ratio K/D',
    stat_hs: '% Tiro a la cabeza',
    stat_winrate: 'Tasa de victorias',
    stat_acs: 'ACS Promedio',
    stat_adr: 'Daño/Ronda (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Victorias',
    stat_matches: 'Partidas',
    stat_fb: 'Primera Sangre',
    stat_damage: 'Daño',
    stat_assists: 'Asistencias',
    stat_ace: 'ACE',

    match_load_more: 'Cargar más (+10)',
    match_victory: 'VICTORIA',
    match_defeat: 'DERROTA',
    match_draw: 'EMPATE',
    match_all_seasons: 'Todas las Temporadas',
    match_all_modes: 'Todo',
    match_ranked: 'Competitivo',
    match_unrated: 'Sin Clasificar',
    match_other: 'Otros',
    match_overview: 'Resumen',
    match_scoreboard: 'Marcador',
    match_timeline: 'Timeline',
    match_duels: 'Duelos',
    match_round: 'Ronda',
    match_rounds: 'Rondas',

    agent_playtime: 'Tiempo de juego',
    agent_games: 'partidas',
    agent_best_agent: 'Agente Principal',

    settings_title: 'Configuración',
    settings_features: 'Funciones',
    settings_privacy: 'Privacidad',
    settings_appearance: 'Apariencia',
    settings_about: 'Acerca de',
    settings_language: 'Idioma',
    settings_save: 'Guardar',
    settings_saving: 'Guardando...',
    settings_saved: '¡Guardado!',

    settings_smart_rating: 'Puntuación Inteligente',
    settings_smart_rating_desc: 'Muestra indicadores visuales en stats por debajo del promedio.',
    settings_video_loop: 'Reproducción en bucle',
    settings_video_loop_desc: 'Reproduce automáticamente los videos de habilidades de agentes.',
    settings_loop_delay: 'Retraso antes de repetir',

    settings_public_profile: 'Perfil público',
    settings_public_profile_desc: 'Otros usuarios pueden buscar y ver tu perfil.',
    settings_hidden_stats: 'Estadísticas ocultas',
    settings_hidden_stats_desc: 'Selecciona las estadísticas a ocultar en tu perfil.',
    settings_enforce_visitors: 'Aplicar a visitantes',
    settings_enforce_visitors_desc: 'Los visitantes solo verán las estadísticas que tú ves.',

    settings_theme: 'Tema',
    settings_theme_dark: 'Oscuro',
    settings_theme_light: 'Claro',
    settings_theme_custom: 'Personalizado',
    settings_banner: 'Banner de perfil',
    settings_banner_url: 'URL del banner',
    settings_banner_offset: 'Posición vertical',
    settings_banner_catalog: 'Catálogo de banners',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Versión',
    settings_about_dev: 'Desarrollado por',
    settings_about_desc: 'Un rastreador de rendimiento Valorant premium con funciones avanzadas.',

    settings_language_title: 'Idioma de la interfaz',
    settings_language_desc: 'Elige el idioma en el que se mostrará la interfaz.',

    wiki_back: 'Volver',
    wiki_description: 'Descripción',
    wiki_video: 'Vídeo',
    wiki_learn_more: 'Saber más',
    wiki_loading: 'Cargando agentes...',
    wiki_no_agents: 'No se encontraron agentes.',

    news_title: 'NOTICIAS',
    news_loading: 'Cargando noticias...',
    news_empty: 'No hay noticias por el momento.',

    error_server: 'Servidor inaccesible.',
    error_private_profile: 'Este perfil es privado.',
    loading_text: 'Cargando...',
    loading_search: 'Buscando...',

    favorites: 'Favoritos',
    debug_generate: 'Generar datos de depuración',
    back_to_agents: 'Volver a los agentes',
    search_button: 'Buscar',
    search_placeholder: 'Buscar un jugador (ej: Usuario#Tag)',
    no_agents_configured: 'No hay agentes configurados',
    loading_agents: 'Cargando agentes...',
    global_stats: 'Estadísticas globales',
    recent_matches: 'Partidas recientes',
    no_matches_found: 'No se encontraron partidas.',
    manage_profile: 'Gestionar perfil',
    logout: 'Cerrar sesión',
    open_tracker_gg: 'Abrir Tracker.gg',
    copy_profile_link: 'Copiar enlace del perfil',
    link_copied: '¡Enlace copiado!',
    search_prompt: 'Busca un jugador para ver sus estadísticas',
    no_player_selected: 'Ningún jugador seleccionado.',
    news_filter_all: 'Todo',
    news_filter_updates: 'Actualizaciones',
    news_filter_esports: 'Esports',
    news_filter_community: 'Comunidad',
    match_filter_all: 'Todo',
    match_filter_competitive: 'Competitivo',
    match_filter_unrated: 'Sin clasificar',
    match_filter_other: 'Otros',
    smart_rating: 'Puntuación Inteligente',
    visual_indicators_desc: 'Muestra indicadores visuales en estadísticas por debajo de la media.',
    video_loop: 'Reproducción de video en bucle',
    video_loop_desc: 'Reproduce automáticamente los videos de habilidades de agentes.',
    video_delay: 'Retraso de repetición',
    back_to_profile: 'Volver al perfil',
    save_settings: 'Guardar configuración',
    cancel: 'Cancelar',
    profile_privacy: 'Privacidad del perfil',
    profile_privacy_desc: 'Gestiona la visibilidad de tu perfil y estadísticas para otros usuarios.',
    public_profile: 'Perfil Público',
    public_profile_desc: 'Tu perfil y estadísticas son visibles para cualquier persona que busque tu nombre.',
    private_profile: 'Perfil Privado',
    private_profile_desc: 'Solo tú puedes ver tus estadísticas cuando inicias sesión. Otros usuarios verán un mensaje indicando que tu perfil es privado.',
    stats_visibility: 'Visibilidad de Estadísticas',
    stats_visibility_desc: 'Desmarca las estadísticas que no deseas ver en tu propio perfil.',
    stat_dd: 'DDΔ / Ronda',
    apply_to_visitors: 'Aplicar a visitantes',
    apply_to_visitors_desc: 'Si está marcado, los visitantes verán exactamente las mismas estadísticas que tú.',
    ui_theme: 'Tema de la interfaz',
    ui_theme_desc: 'Elige un tema visual para la aplicación.',
    theme_dark: 'Oscuro',
    theme_light: 'Claro',
    theme_midnight: 'Medianoche',
    theme_crimson: 'Carmesí',
    theme_ocean: 'Océano',
    theme_custom: 'Personalizado',
    color_customization: 'Personalización de colores',
    accent_color: 'Color de acento',
    bg_color: 'Color de fondo',
    banner_customization: 'Personalización del banner',
    banner_default: 'Por defecto',
    see_more: 'Ver más',
    vertical_crop: 'Recorte vertical (Altura)',
    preview: 'Vista previa',
    avatar: 'Avatar',
    live_preview: 'Vista previa en vivo',
    live_preview_desc: 'Arrastra el control deslizante para ver cómo se ajusta la imagen en tiempo real en el marco de arriba.',
    footer_desc: 'Aplicación de seguimiento de rendimiento para Valorant. Utiliza la API oficial de Riot Games.',
    footer_legal: 'Spycam no está afiliado a Riot Games y no refleja las opiniones de Riot Games ni de nadie involucrado en la producción o gestión de las propiedades de Riot Games. Riot Games y todas las propiedades asociadas son marcas comerciales o marcas comerciales registradas de Riot Games, Inc.',
    role_duelist: 'Duelista',
    role_initiator: 'Iniciador',
    role_controller: 'Controlador',
    role_sentinel: 'Centinela',
    logout_button: 'Cerrar sesión',
    add_favorite: 'Añadir a favoritos',
    remove_favorite: 'Quitar de favoritos',
  },

  // ==================== DEUTSCH ====================
  de: {
    nav_home: 'Startseite',
    nav_news: 'Neuigkeiten',
    nav_agents: 'Agenten Wiki',
    nav_settings: 'Einstellungen',
    nav_logout: 'Abmelden',
    nav_back_profile: 'Zurück zu meinem Profil',
    nav_search_placeholder: 'Suche Benutzername#Tag',

    tab_performance: 'Leistung',
    tab_agents: 'Agenten',
    tab_history: 'Verlauf',

    stat_kills: 'Kills',
    stat_deaths: 'Tode',
    stat_kd: 'K/D-Verhältnis',
    stat_hs: 'Kopfschuss %',
    stat_winrate: 'Siegesrate',
    stat_acs: 'Durchschn. ACS',
    stat_adr: 'Schaden/Runde (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Siege',
    stat_matches: 'Spiele',
    stat_fb: 'First Bloods',
    stat_damage: 'Schaden',
    stat_assists: 'Assists',
    stat_ace: 'ACE',

    match_load_more: 'Mehr laden (+10)',
    match_victory: 'SIEG',
    match_defeat: 'NIEDERLAGE',
    match_draw: 'UNENTSCHIEDEN',
    match_all_seasons: 'Alle Saisons',
    match_all_modes: 'Alle',
    match_ranked: 'Gewertet',
    match_unrated: 'Ungewertet',
    match_other: 'Andere',
    match_overview: 'Übersicht',
    match_scoreboard: 'Ergebnistafel',
    match_timeline: 'Timeline',
    match_duels: 'Duelle',
    match_round: 'Runde',
    match_rounds: 'Runden',

    agent_playtime: 'Spielzeit',
    agent_games: 'Spiele',
    agent_best_agent: 'Hauptagent',

    settings_title: 'Einstellungen',
    settings_features: 'Funktionen',
    settings_privacy: 'Datenschutz',
    settings_appearance: 'Darstellung',
    settings_about: 'Über',
    settings_language: 'Sprache',
    settings_save: 'Speichern',
    settings_saving: 'Speichern...',
    settings_saved: 'Gespeichert!',

    settings_smart_rating: 'Intelligente Bewertung',
    settings_smart_rating_desc: 'Zeigt visuelle Indikatoren bei unterdurchschnittlichen Statistiken.',
    settings_video_loop: 'Video-Schleifenwiedergabe',
    settings_video_loop_desc: 'Spielt Agenten-Fähigkeitsvideos automatisch erneut ab.',
    settings_loop_delay: 'Verzögerung vor Wiederholung',

    settings_public_profile: 'Öffentliches Profil',
    settings_public_profile_desc: 'Andere Benutzer können Ihr Profil suchen und anzeigen.',
    settings_hidden_stats: 'Versteckte Statistiken',
    settings_hidden_stats_desc: 'Wählen Sie die Statistiken aus, die in Ihrem Profil ausgeblendet werden sollen.',
    settings_enforce_visitors: 'Für Besucher anwenden',
    settings_enforce_visitors_desc: 'Besucher sehen nur die Statistiken, die Sie sehen.',

    settings_theme: 'Design',
    settings_theme_dark: 'Dunkel',
    settings_theme_light: 'Hell',
    settings_theme_custom: 'Benutzerdefiniert',
    settings_banner: 'Profilbanner',
    settings_banner_url: 'Banner-URL',
    settings_banner_offset: 'Vertikale Position',
    settings_banner_catalog: 'Banner-Katalog',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Version',
    settings_about_dev: 'Entwickelt von',
    settings_about_desc: 'Ein Premium-Valorant-Leistungstracker mit erweiterten Funktionen.',

    settings_language_title: 'Sprache der Oberfläche',
    settings_language_desc: 'Wählen Sie die Sprache für die Benutzeroberfläche.',

    wiki_back: 'Zurück',
    wiki_description: 'Beschreibung',
    wiki_video: 'Video',
    wiki_learn_more: 'Mehr erfahren',
    wiki_loading: 'Agenten werden geladen...',
    wiki_no_agents: 'Keine Agenten gefunden.',

    news_title: 'NACHRICHTEN',
    news_loading: 'Neuigkeiten werden geladen...',
    news_empty: 'Keine Neuigkeiten im Moment.',

    error_server: 'Server nicht erreichbar.',
    error_private_profile: 'Dieses Profil ist privat.',
    loading_text: 'Wird geladen...',
    loading_search: 'Suche läuft...',

    favorites: 'Favoriten',
    debug_generate: 'Debug-Daten generieren',
    back_to_agents: 'Zurück zu Agenten',
    search_button: 'Suchen',
    search_placeholder: 'Spieler suchen (z.B. Benutzername#Tag)',
    no_agents_configured: 'Keine Agenten konfiguriert',
    loading_agents: 'Agenten werden geladen...',
    global_stats: 'Gesamtstatistiken',
    recent_matches: 'Letzte Spiele',
    no_matches_found: 'Kein Spiel gefunden.',
    manage_profile: 'Profil verwalten',
    logout: 'Abmelden',
    open_tracker_gg: 'Tracker.gg öffnen',
    copy_profile_link: 'Profillink kopieren',
    link_copied: 'Link kopiert!',
    search_prompt: 'Spieler suchen, um Statistiken zu sehen',
    no_player_selected: 'Kein Spieler ausgewählt.',
    news_filter_all: 'Alle',
    news_filter_updates: 'Updates',
    news_filter_esports: 'Esports',
    news_filter_community: 'Community',
    match_filter_all: 'Alle',
    match_filter_competitive: 'Gewertet',
    match_filter_unrated: 'Ungewertet',
    match_filter_other: 'Andere',
    smart_rating: 'Intelligente Bewertung',
    visual_indicators_desc: 'Zeigt visuelle Indikatoren bei unterdurchschnittlichen Werten an.',
    video_loop: 'Video-Dauerschleife',
    video_loop_desc: 'Gibt Agenten-Fähigkeitsvideos automatisch wieder.',
    video_delay: 'Wiederholungsverzögerung',
    back_to_profile: 'Zurück zum Profil',
    save_settings: 'Einstellungen speichern',
    cancel: 'Abbrechen',
    profile_privacy: 'Profil-Datenschutz',
    profile_privacy_desc: 'Verwalte die Sichtbarkeit deines Profils und deiner Statistiken für andere Benutzer.',
    public_profile: 'Öffentliches Profil',
    public_profile_desc: 'Dein Profil und deine Statistiken sind für jeden sichtbar, der nach deinem Namen sucht.',
    private_profile: 'Privates Profil',
    private_profile_desc: 'Nur du kannst deine Statistiken einsehen, wenn du angemeldet bist. Andere Benutzer sehen eine Meldung, dass dein Profil privat ist.',
    stats_visibility: 'Sichtbarkeit der Statistiken',
    stats_visibility_desc: 'Deaktiviere die Statistiken, die du nicht auf deinem eigenen Profil sehen möchtest.',
    stat_dd: 'DDΔ / Runde',
    apply_to_visitors: 'Auf Besucher anwenden',
    apply_to_visitors_desc: 'Wenn aktiviert, sehen Besucher genau die gleichen Statistiken wie du.',
    ui_theme: 'UI-Design',
    ui_theme_desc: 'Wähle ein visuelles Design für die Anwendung.',
    theme_dark: 'Dunkel',
    theme_light: 'Hell',
    theme_midnight: 'Mitternacht',
    theme_crimson: 'Karminrot',
    theme_ocean: 'Ozean',
    theme_custom: 'Benutzerdefiniert',
    color_customization: 'Farbanpassung',
    accent_color: 'Akzentfarbe',
    bg_color: 'Hintergrundfarbe',
    banner_customization: 'Banner-Anpassung',
    banner_default: 'Standard',
    see_more: 'Mehr anzeigen',
    vertical_crop: 'Vertikaler Zuschnitt (Höhe)',
    preview: 'Vorschau',
    avatar: 'Avatar',
    live_preview: 'Live-Vorschau',
    live_preview_desc: 'Ziehe den Schieberegler, um zu sehen, wie sich das Bild im Rahmen oben in Echtzeit anpasst.',
    footer_desc: 'Leistungs-Tracking-App für Valorant. Verwendet die offizielle Riot Games API.',
    footer_legal: 'Spycam ist nicht mit Riot Games verbunden und spiegelt nicht die Ansichten oder Meinungen von Riot Games oder Personen wider, die offiziell an der Produktion oder Verwaltung von Riot Games-Eigentum beteiligt sind. Riot Games und alle zugehörigen Eigenschaften sind Marken oder eingetragene Marken von Riot Games, Inc.',
    role_duelist: 'Duellant',
    role_initiator: 'Initiator',
    role_controller: 'Taktiker',
    role_sentinel: 'Wächter',
    logout_button: 'Abmelden',
    add_favorite: 'Zu Favoriten hinzufügen',
    remove_favorite: 'Aus Favoriten entfernen',
  },

  // ==================== PORTUGUÊS ====================
  pt: {
    nav_home: 'Início',
    nav_news: 'Notícias',
    nav_agents: 'Wiki Agentes',
    nav_settings: 'Configurações',
    nav_logout: 'Sair',
    nav_back_profile: 'Voltar ao meu perfil',
    nav_search_placeholder: 'Buscar Usuário#Tag',

    tab_performance: 'Desempenho',
    tab_agents: 'Agentes',
    tab_history: 'Histórico',

    stat_kills: 'Abates',
    stat_deaths: 'Mortes',
    stat_kd: 'Taxa K/D',
    stat_hs: '% de Headshot',
    stat_winrate: 'Taxa de Vitórias',
    stat_acs: 'ACS Médio',
    stat_adr: 'Dano/Rodada (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Vitórias',
    stat_matches: 'Partidas',
    stat_fb: 'Primeiro Abate',
    stat_damage: 'Dano',
    stat_assists: 'Assistências',
    stat_ace: 'ACE',

    match_load_more: 'Carregar mais (+10)',
    match_victory: 'VITÓRIA',
    match_defeat: 'DERROTA',
    match_draw: 'EMPATE',
    match_all_seasons: 'Todas as Temporadas',
    match_all_modes: 'Todos',
    match_ranked: 'Ranqueado',
    match_unrated: 'Sem Classificação',
    match_other: 'Outros',
    match_overview: 'Visão Geral',
    match_scoreboard: 'Placar',
    match_timeline: 'Timeline',
    match_duels: 'Duelos',
    match_round: 'Round',
    match_rounds: 'Rounds',

    agent_playtime: 'Tempo de jogo',
    agent_games: 'partidas',
    agent_best_agent: 'Agente Principal',

    settings_title: 'Configurações',
    settings_features: 'Recursos',
    settings_privacy: 'Privacidade',
    settings_appearance: 'Aparência',
    settings_about: 'Sobre',
    settings_language: 'Idioma',
    settings_save: 'Salvar',
    settings_saving: 'Salvando...',
    settings_saved: 'Salvo!',

    settings_smart_rating: 'Classificação Inteligente',
    settings_smart_rating_desc: 'Exibe indicadores visuais em stats abaixo da média.',
    settings_video_loop: 'Reprodução em loop',
    settings_video_loop_desc: 'Reproduz automaticamente os vídeos de habilidades dos agentes.',
    settings_loop_delay: 'Atraso antes de repetir',

    settings_public_profile: 'Perfil público',
    settings_public_profile_desc: 'Outros usuários podem buscar e ver seu perfil.',
    settings_hidden_stats: 'Estatísticas ocultas',
    settings_hidden_stats_desc: 'Selecione as estatísticas para ocultar no seu perfil.',
    settings_enforce_visitors: 'Aplicar aos visitantes',
    settings_enforce_visitors_desc: 'Os visitantes verão apenas as estatísticas que você vê.',

    settings_theme: 'Tema',
    settings_theme_dark: 'Escuro',
    settings_theme_light: 'Claro',
    settings_theme_custom: 'Personalizado',
    settings_banner: 'Banner do perfil',
    settings_banner_url: 'URL do banner',
    settings_banner_offset: 'Posição vertical',
    settings_banner_catalog: 'Catálogo de banners',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Versão',
    settings_about_dev: 'Desenvolvido por',
    settings_about_desc: 'Um rastreador de desempenho Valorant premium com recursos avançados.',

    settings_language_title: 'Idioma da interface',
    settings_language_desc: 'Escolha o idioma em que a interface será exibida.',

    wiki_back: 'Voltar',
    wiki_description: 'Descrição',
    wiki_video: 'Vídeo',
    wiki_learn_more: 'Saiba mais',
    wiki_loading: 'Carregando agentes...',
    wiki_no_agents: 'Nenhum agente encontrado.',

    news_title: 'NOTÍCIAS',
    news_loading: 'Carregando notícias...',
    news_empty: 'Nenhuma notícia no momento.',

    error_server: 'Servidor inacessível.',
    error_private_profile: 'Este perfil é privado.',
    loading_text: 'Carregando...',
    loading_search: 'Buscando...',

    favorites: 'Favoritos',
    debug_generate: 'Gerar dados de depuração',
    back_to_agents: 'Voltar aos agentes',
    search_button: 'Buscar',
    search_placeholder: 'Buscar um jogador (ex: Usuário#Tag)',
    no_agents_configured: 'Nenhum agente configurado',
    loading_agents: 'Carregando agentes...',
    global_stats: 'Estatísticas globais',
    recent_matches: 'Partidas recentes',
    no_matches_found: 'Nenhuma partida encontrada.',
    manage_profile: 'Gerenciar perfil',
    logout: 'Sair',
    open_tracker_gg: 'Abrir Tracker.gg',
    copy_profile_link: 'Copiar link do perfil',
    link_copied: 'Link copiado!',
    search_prompt: 'Busque um jogador para ver suas estatísticas',
    no_player_selected: 'Nenhum jogador selecionado.',
    news_filter_all: 'Tudo',
    news_filter_updates: 'Atualizações',
    news_filter_esports: 'Esports',
    news_filter_community: 'Comunidade',
    match_filter_all: 'Tudo',
    match_filter_competitive: 'Competitivo',
    match_filter_unrated: 'Sem Classificação',
    match_filter_other: 'Outros',
    smart_rating: 'Classificação Inteligente',
    visual_indicators_desc: 'Exibe indicadores visuais em estatísticas abaixo da média.',
    video_loop: 'Reprodução de vídeo em loop',
    video_loop_desc: 'Reproduz automaticamente vídeos de habilidades dos agentes.',
    video_delay: 'Atraso de repetição',
    back_to_profile: 'Voltar ao perfil',
    save_settings: 'Salvar configurações',
    cancel: 'Cancelar',
    profile_privacy: 'Privacidade do Perfil',
    profile_privacy_desc: 'Gerencie a visibilidade do seu perfil e estatísticas para outros usuários.',
    public_profile: 'Perfil Público',
    public_profile_desc: 'Seu perfil e estatísticas são visíveis para qualquer pessoa que pesquise pelo seu nome.',
    private_profile: 'Perfil Privado',
    private_profile_desc: 'Apenas você pode ver suas estatísticas quando estiver conectado. Outros usuários verão uma mensagem indicando que seu perfil é privado.',
    stats_visibility: 'Visibilidade das Estatísticas',
    stats_visibility_desc: 'Desmarque as estatísticas que você não quer ver em seu próprio perfil.',
    stat_dd: 'DDΔ / Rodada',
    apply_to_visitors: 'Aplicar aos visitantes',
    apply_to_visitors_desc: 'Se marcado, os visitantes verão exatamente as mesmas estatísticas que você.',
    ui_theme: 'Tema da Interface',
    ui_theme_desc: 'Escolha um tema visual para o aplicativo.',
    theme_dark: 'Escuro',
    theme_light: 'Claro',
    theme_midnight: 'Meia-noite',
    theme_crimson: 'Carmesim',
    theme_ocean: 'Oceano',
    theme_custom: 'Personalizado',
    color_customization: 'Personalização de Cores',
    accent_color: 'Cor de Destaque',
    bg_color: 'Cor de Fundo',
    banner_customization: 'Personalização do Banner',
    banner_default: 'Padrão',
    see_more: 'Ver mais',
    vertical_crop: 'Corte Vertical (Altura)',
    preview: 'Pré-visualização',
    avatar: 'Avatar',
    live_preview: 'Pré-visualização ao vivo',
    live_preview_desc: 'Arraste o controle deslizante para ver a imagem se ajustar em tempo real no quadro acima.',
    footer_desc: 'Aplicativo de rastreamento de desempenho para Valorant. Usa a API oficial da Riot Games.',
    footer_legal: 'Spycam não é afiliado à Riot Games e não reflete as opiniões da Riot Games ou de qualquer pessoa envolvida na produção ou gestão das propriedades da Riot Games. Riot Games e todas as propriedades associadas são marcas comerciais ou marcas registradas da Riot Games, Inc.',
    role_duelist: 'Duelista',
    role_initiator: 'Iniciador',
    role_controller: 'Controlador',
    role_sentinel: 'Sentinela',
    logout_button: 'Sair',
    add_favorite: 'Adicionar aos favoritos',
    remove_favorite: 'Remover dos favoritos',
  },

  // ==================== ITALIANO ====================
  it: {
    nav_home: 'Home',
    nav_news: 'Notizie',
    nav_agents: 'Wiki Agenti',
    nav_settings: 'Impostazioni',
    nav_logout: 'Esci',
    nav_back_profile: 'Torna al mio profilo',
    nav_search_placeholder: 'Cerca Utente#Tag',

    tab_performance: 'Prestazioni',
    tab_agents: 'Agenti',
    tab_history: 'Cronologia',

    stat_kills: 'Uccisioni',
    stat_deaths: 'Morti',
    stat_kd: 'Rapporto K/D',
    stat_hs: 'Percentuale Colpi alla Testa',
    stat_winrate: 'Percentuale Vittorie',
    stat_acs: 'ACS Medio',
    stat_adr: 'Danni/Round (ADR)',
    stat_kast: 'KAST',
    stat_wins: 'Vittorie',
    stat_matches: 'Partite',
    stat_fb: 'Primo Sangue',
    stat_damage: 'Danni',
    stat_assists: 'Assist',
    stat_ace: 'ACE',

    match_load_more: 'Carica di più (+10)',
    match_victory: 'VITTORIA',
    match_defeat: 'SCONFITTA',
    match_draw: 'PAREGGIO',
    match_all_seasons: 'Tutte le Stagioni',
    match_all_modes: 'Tutti',
    match_ranked: 'Classificata',
    match_unrated: 'Non Classificata',
    match_other: 'Altro',
    match_overview: 'Panoramica',
    match_scoreboard: 'Classifica',
    match_timeline: 'Timeline',
    match_duels: 'Duelli',
    match_round: 'Round',
    match_rounds: 'Round',

    agent_playtime: 'Tempo di gioco',
    agent_games: 'partite',
    agent_best_agent: 'Agente Principale',

    settings_title: 'Impostazioni',
    settings_features: 'Funzionalità',
    settings_privacy: 'Privacy',
    settings_appearance: 'Aspetto',
    settings_about: 'Informazioni',
    settings_language: 'Lingua',
    settings_save: 'Salva',
    settings_saving: 'Salvataggio...',
    settings_saved: 'Salvato!',

    settings_smart_rating: 'Valutazione Intelligente',
    settings_smart_rating_desc: 'Mostra indicatori visivi sulle statistiche sotto la media.',
    settings_video_loop: 'Riproduzione video in loop',
    settings_video_loop_desc: 'Riproduce automaticamente i video delle abilità degli agenti.',
    settings_loop_delay: 'Ritardo prima della ripetizione',

    settings_public_profile: 'Profilo pubblico',
    settings_public_profile_desc: 'Altri utenti possono cercare e visualizzare il tuo profilo.',
    settings_hidden_stats: 'Statistiche nascoste',
    settings_hidden_stats_desc: 'Seleziona le statistiche da nascondere nel tuo profilo.',
    settings_enforce_visitors: 'Applica ai visitatori',
    settings_enforce_visitors_desc: 'I visitatori vedranno solo le statistiche che vedi tu.',

    settings_theme: 'Tema',
    settings_theme_dark: 'Scuro',
    settings_theme_light: 'Chiaro',
    settings_theme_custom: 'Personalizzato',
    settings_banner: 'Banner del profilo',
    settings_banner_url: 'URL del banner',
    settings_banner_offset: 'Posizione verticale',
    settings_banner_catalog: 'Catalogo banner',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'Versione',
    settings_about_dev: 'Sviluppato da',
    settings_about_desc: 'Un tracker di prestazioni Valorant premium con funzionalità avanzate.',

    settings_language_title: 'Lingua dell\'interfaccia',
    settings_language_desc: 'Scegli la lingua in cui verrà visualizzata l\'interfaccia.',

    wiki_back: 'Indietro',
    wiki_description: 'Descrizione',
    wiki_video: 'Video',
    wiki_learn_more: 'Per saperne di più',
    wiki_loading: 'Caricamento agenti...',
    wiki_no_agents: 'Nessun agente trovato.',

    news_title: 'NOTIZIE',
    news_loading: 'Caricamento notizie...',
    news_empty: 'Nessuna notizia al momento.',

    error_server: 'Server irraggiungibile.',
    error_private_profile: 'Questo profilo è privato.',
    loading_text: 'Caricamento...',
    loading_search: 'Ricerca in corso...',

    favorites: 'Preferiti',
    debug_generate: 'Genera dati di debug',
    back_to_agents: 'Torna agli agenti',
    search_button: 'Cerca',
    search_placeholder: 'Cerca un giocatore (es: Utente#Tag)',
    no_agents_configured: 'Nessun agente configurato',
    loading_agents: 'Caricamento agenti...',
    global_stats: 'Statistiche globali',
    recent_matches: 'Partite recenti',
    no_matches_found: 'Nessuna partita trovata.',
    manage_profile: 'Gestisci profilo',
    logout: 'Esci',
    open_tracker_gg: 'Apri Tracker.gg',
    copy_profile_link: 'Copia link del profilo',
    link_copied: 'Link copiato!',
    search_prompt: 'Cerca un giocatore per vedere le sue statistiche',
    no_player_selected: 'Nessun giocatore selezionato.',
    news_filter_all: 'Tutto',
    news_filter_updates: 'Aggiornamenti',
    news_filter_esports: 'Esport',
    news_filter_community: 'Comunità',
    match_filter_all: 'Tutto',
    match_filter_competitive: 'Competitiva',
    match_filter_unrated: 'Non classificata',
    match_filter_other: 'Altro',
    smart_rating: 'Valutazione Intelligente',
    visual_indicators_desc: 'Mostra indicatori visivi per le statistiche sotto la media.',
    video_loop: 'Riproduzione video in loop',
    video_loop_desc: 'Riproduce automaticamente i video delle abilità degli agenti.',
    video_delay: 'Ritardo riproduzione',
    back_to_profile: 'Torna al profilo',
    save_settings: 'Salva impostazioni',
    cancel: 'Annulla',
    profile_privacy: 'Privacy del Profilo',
    profile_privacy_desc: 'Gestisci la visibilità del tuo profilo e delle tue statistiche per gli altri utenti.',
    public_profile: 'Profilo Pubblico',
    public_profile_desc: 'Il tuo profilo e le tue statistiche sono visibili a chiunque cerchi il tuo nome.',
    private_profile: 'Profilo Privato',
    private_profile_desc: 'Solo tu puoi visualizzare le tue statistiche quando sei connesso. Gli altri utenti vedranno un messaggio che indica che il tuo profilo è privato.',
    stats_visibility: 'Visibilità Statistiche',
    stats_visibility_desc: 'Deseleziona le statistiche che non vuoi vedere sul tuo profilo.',
    stat_dd: 'DDΔ / Round',
    apply_to_visitors: 'Applica ai visitatori',
    apply_to_visitors_desc: 'Se selezionato, i visitatori vedranno esattamente le stesse statistiche che vedi tu.',
    ui_theme: 'Tema UI',
    ui_theme_desc: 'Scegli un tema visivo per l\'applicazione.',
    theme_dark: 'Scuro',
    theme_light: 'Chiaro',
    theme_midnight: 'Mezzanotte',
    theme_crimson: 'Cremisi',
    theme_ocean: 'Oceano',
    theme_custom: 'Personalizzato',
    color_customization: 'Personalizzazione Colore',
    accent_color: 'Colore Accento',
    bg_color: 'Colore di Sfondo',
    banner_customization: 'Personalizzazione Banner',
    banner_default: 'Predefinito',
    see_more: 'Vedi altro',
    vertical_crop: 'Ritaglio Verticale (Altezza)',
    preview: 'Anteprima',
    avatar: 'Avatar',
    live_preview: 'Anteprima in tempo reale',
    live_preview_desc: 'Trascina il cursore per vedere l\'immagine adattarsi in tempo reale nella cornice in alto.',
    footer_desc: 'App di monitoraggio delle prestazioni per Valorant. Utilizza l\'API ufficiale di Riot Games.',
    footer_legal: 'Spycam non è affiliato a Riot Games e non riflette le opinioni di Riot Games o di chiunque sia coinvolto nella produzione o gestione delle proprietà di Riot Games. Riot Games e tutte le proprietà associate sono marchi o marchi registrati di Riot Games, Inc.',
    role_duelist: 'Assassino',
    role_initiator: 'Iniziatore',
    role_controller: 'Stratega',
    role_sentinel: 'Sentinella',
    logout_button: 'Esci',
    add_favorite: 'Aggiungi ai preferiti',
    remove_favorite: 'Rimuovi dai preferiti',
  },

  // ==================== 日本語 ====================
  ja: {
    nav_home: 'ホーム',
    nav_news: 'ニュース',
    nav_agents: 'エージェントWiki',
    nav_settings: '設定',
    nav_logout: 'ログアウト',
    nav_back_profile: 'マイプロフィールに戻る',
    nav_search_placeholder: 'ユーザー名#タグを検索',

    tab_performance: 'パフォーマンス',
    tab_agents: 'エージェント',
    tab_history: '履歴',

    stat_kills: 'キル',
    stat_deaths: 'デス',
    stat_kd: 'K/D',
    stat_hs: 'ヘッドショット率',
    stat_winrate: '勝率',
    stat_acs: '平均ACS',
    stat_adr: 'ラウンドごとのダメージ(ADR)',
    stat_kast: 'KAST',
    stat_wins: '勝利数',
    stat_matches: '試合数',
    stat_fb: 'ファーストブラッド',
    stat_damage: 'ダメージ',
    stat_assists: 'アシスト',
    stat_ace: 'ACE',

    match_load_more: 'もっと読み込む (+10)',
    match_victory: '勝利',
    match_defeat: '敗北',
    match_draw: '引き分け',
    match_all_seasons: '全シーズン',
    match_all_modes: 'すべて',
    match_ranked: 'ランク',
    match_unrated: 'アンレート',
    match_other: 'その他',
    match_overview: '概要',
    match_scoreboard: 'スコアボード',
    match_timeline: 'タイムライン',
    match_duels: 'デュエル',
    match_round: 'ラウンド',
    match_rounds: 'ラウンド',

    agent_playtime: 'プレイ時間',
    agent_games: '試合',
    agent_best_agent: 'メインエージェント',

    settings_title: '設定',
    settings_features: '機能',
    settings_privacy: 'プライバシー',
    settings_appearance: '外観',
    settings_about: '情報',
    settings_language: '言語',
    settings_save: '保存',
    settings_saving: '保存中...',
    settings_saved: '保存しました！',

    settings_smart_rating: 'スマート評価',
    settings_smart_rating_desc: '平均以下の統計に視覚的インジケーターを表示します。',
    settings_video_loop: 'ビデオループ再生',
    settings_video_loop_desc: 'エージェントのアビリティ動画を自動的に再生します。',
    settings_loop_delay: 'リプレイ前の遅延',

    settings_public_profile: '公開プロフィール',
    settings_public_profile_desc: '他のユーザーがあなたのプロフィールを検索・閲覧できます。',
    settings_hidden_stats: '非表示の統計',
    settings_hidden_stats_desc: 'プロフィールで非表示にする統計を選択してください。',
    settings_enforce_visitors: '訪問者に適用',
    settings_enforce_visitors_desc: '訪問者はあなたが見ている統計のみを見ることができます。',

    settings_theme: 'テーマ',
    settings_theme_dark: 'ダーク',
    settings_theme_light: 'ライト',
    settings_theme_custom: 'カスタム',
    settings_banner: 'プロフィールバナー',
    settings_banner_url: 'バナーURL',
    settings_banner_offset: '垂直位置',
    settings_banner_catalog: 'バナーカタログ',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: 'バージョン',
    settings_about_dev: '開発者',
    settings_about_desc: '高度な機能を備えたプレミアムValorantパフォーマンストラッカー。',

    settings_language_title: 'インターフェース言語',
    settings_language_desc: 'インターフェースの表示言語を選択してください。',

    wiki_back: '戻る',
    wiki_description: '説明',
    wiki_video: '動画',
    wiki_learn_more: '詳しく見る',
    wiki_loading: 'エージェントを読み込み中...',
    wiki_no_agents: 'エージェントが見つかりませんでした。',

    news_title: 'ニュース',
    news_loading: 'ニュースを読み込み中...',
    news_empty: '現在ニュースはありません。',

    error_server: 'サーバーに接続できません。',
    error_private_profile: 'このプロフィールは非公開です。',
    loading_text: '読み込み中...',
    loading_search: '検索中...',

    favorites: 'お気に入り',
    debug_generate: 'デバッグデータを生成',
    back_to_agents: 'エージェント一覧に戻る',
    search_button: '検索',
    search_placeholder: 'プレイヤーを検索（例: ユーザー名#タグ）',
    no_agents_configured: '設定済みのエージェントがありません',
    loading_agents: 'エージェントを読み込み中...',
    global_stats: '全体統計',
    recent_matches: '最近の試合',
    no_matches_found: '試合が見つかりません。',
    manage_profile: 'プロフィール管理',
    logout: 'ログアウト',
    open_tracker_gg: 'Tracker.ggを開く',
    copy_profile_link: 'プロフィールリンクをコピー',
    link_copied: 'リンクをコピーしました！',
    search_prompt: 'プレイヤーを検索して統計を見る',
    no_player_selected: 'プレイヤーが選択されていません。',
    news_filter_all: 'すべて',
    news_filter_updates: 'アップデート',
    news_filter_esports: 'Eスポーツ',
    news_filter_community: 'コミュニティ',
    match_filter_all: 'すべて',
    match_filter_competitive: 'コンペティティブ',
    match_filter_unrated: 'アンレート',
    match_filter_other: 'その他',
    smart_rating: 'スマートレーティング',
    visual_indicators_desc: '平均以下のステータスに視覚的なインジケーターを表示します。',
    video_loop: 'ビデオループ再生',
    video_loop_desc: 'エージェントのアビリティビデオを自動的にリプレイします。',
    video_delay: 'リプレイ遅延',
    back_to_profile: 'プロフィールに戻る',
    save_settings: '設定を保存',
    cancel: 'キャンセル',
    profile_privacy: 'プロフィールのプライバシー',
    profile_privacy_desc: '他のユーザーに対するプロフィールと統計情報の表示を管理します。',
    public_profile: '公開プロフィール',
    public_profile_desc: 'あなたのプロフィールと統計情報は、あなたの名前を検索するすべてのユーザーに公開されます。',
    private_profile: '非公開プロフィール',
    private_profile_desc: 'ログイン中はあなたのみが統計情報を確認できます。他のユーザーにはプロフィールが非公開であることを示すメッセージが表示されます。',
    stats_visibility: '統計の表示',
    stats_visibility_desc: '自分のプロフィールに表示したくない統計のチェックを外します。',
    stat_dd: 'DDΔ / ラウンド',
    apply_to_visitors: '訪問者に適用',
    apply_to_visitors_desc: 'チェックを入れると、訪問者はあなたとまったく同じ統計情報を見るようになります。',
    ui_theme: 'UIテーマ',
    ui_theme_desc: 'アプリケーションの視覚的なテーマを選択します。',
    theme_dark: 'ダーク',
    theme_light: 'ライト',
    theme_midnight: 'ミッドナイト',
    theme_crimson: 'クリムゾン',
    theme_ocean: 'オーシャン',
    theme_custom: 'カスタム',
    color_customization: 'カラーのカスタマイズ',
    accent_color: 'アクセントカラー',
    bg_color: '背景色',
    banner_customization: 'バナーのカスタマイズ',
    banner_default: 'デフォルト',
    see_more: 'もっと見る',
    vertical_crop: '垂直クロップ (高さ)',
    preview: 'プレビュー',
    avatar: 'アバター',
    live_preview: 'ライブプレビュー',
    live_preview_desc: 'スライダーをドラッグすると、上のフレームで画像がリアルタイムに調整されるのを確認できます。',
    footer_desc: 'Valorantのパフォーマンス追跡アプリ。公式のRiot Games APIを使用しています。',
    footer_legal: 'SpycamはRiot Gamesとは提携しておらず、Riot GamesやRiot Gamesの資産の制作・管理に関わるいかなる人物の見解や意見を反映するものではありません。Riot Gamesおよび関連するすべての資産は、Riot Games, Inc.の商標または登録商標です。',
    role_duelist: 'デュエリスト',
    role_initiator: 'イニシエーター',
    role_controller: 'コントローラー',
    role_sentinel: 'センチネル',
    logout_button: 'ログアウト',
    add_favorite: 'お気に入りに追加',
    remove_favorite: 'お気に入りから削除',
  },

  // ==================== 한국어 ====================
  ko: {
    nav_home: '홈',
    nav_news: '뉴스',
    nav_agents: '에이전트 위키',
    nav_settings: '설정',
    nav_logout: '로그아웃',
    nav_back_profile: '내 프로필로 돌아가기',
    nav_search_placeholder: '사용자명#태그 검색',

    tab_performance: '성과',
    tab_agents: '에이전트',
    tab_history: '기록',

    stat_kills: '킬',
    stat_deaths: '데스',
    stat_kd: 'K/D 비율',
    stat_hs: '헤드샷 %',
    stat_winrate: '승률',
    stat_acs: '평균 ACS',
    stat_adr: '라운드당 피해량 (ADR)',
    stat_kast: 'KAST',
    stat_wins: '승리',
    stat_matches: '경기',
    stat_fb: '퍼스트 블러드',
    stat_damage: '피해량',
    stat_assists: '어시스트',
    stat_ace: 'ACE',

    match_load_more: '더 불러오기 (+10)',
    match_victory: '승리',
    match_defeat: '패배',
    match_draw: '무승부',
    match_all_seasons: '모든 시즌',
    match_all_modes: '전체',
    match_ranked: '경쟁전',
    match_unrated: '일반전',
    match_other: '기타',
    match_overview: '개요',
    match_scoreboard: '스코어보드',
    match_timeline: '타임라인',
    match_duels: '듀얼',
    match_round: '라운드',
    match_rounds: '라운드',

    agent_playtime: '플레이 시간',
    agent_games: '경기',
    agent_best_agent: '메인 에이전트',

    settings_title: '설정',
    settings_features: '기능',
    settings_privacy: '개인정보',
    settings_appearance: '외관',
    settings_about: '정보',
    settings_language: '언어',
    settings_save: '저장',
    settings_saving: '저장 중...',
    settings_saved: '저장되었습니다!',

    settings_smart_rating: '스마트 평가',
    settings_smart_rating_desc: '평균 이하의 통계에 시각적 표시를 합니다.',
    settings_video_loop: '비디오 반복 재생',
    settings_video_loop_desc: '에이전트 능력 동영상을 자동으로 재생합니다.',
    settings_loop_delay: '반복 전 지연',

    settings_public_profile: '공개 프로필',
    settings_public_profile_desc: '다른 사용자가 내 프로필을 검색하고 볼 수 있습니다.',
    settings_hidden_stats: '숨겨진 통계',
    settings_hidden_stats_desc: '프로필에서 숨길 통계를 선택하세요.',
    settings_enforce_visitors: '방문자에게 적용',
    settings_enforce_visitors_desc: '방문자는 당신이 보는 통계만 볼 수 있습니다.',

    settings_theme: '테마',
    settings_theme_dark: '다크',
    settings_theme_light: '라이트',
    settings_theme_custom: '사용자 정의',
    settings_banner: '프로필 배너',
    settings_banner_url: '배너 URL',
    settings_banner_offset: '세로 위치',
    settings_banner_catalog: '배너 카탈로그',

    settings_about_title: 'SPYCAM — Valorant Tracker',
    settings_about_version: '버전',
    settings_about_dev: '개발자',
    settings_about_desc: '고급 기능을 갖춘 프리미엄 발로란트 퍼포먼스 트래커.',

    settings_language_title: '인터페이스 언어',
    settings_language_desc: '인터페이스가 표시될 언어를 선택하세요.',

    wiki_back: '뒤로',
    wiki_description: '설명',
    wiki_video: '영상',
    wiki_learn_more: '자세히 보기',
    wiki_loading: '에이전트 로딩 중...',
    wiki_no_agents: '에이전트를 찾을 수 없습니다.',

    news_title: '뉴스',
    news_loading: '뉴스 로딩 중...',
    news_empty: '현재 뉴스가 없습니다.',

    error_server: '서버에 연결할 수 없습니다.',
    error_private_profile: '이 프로필은 비공개입니다.',
    loading_text: '로딩 중...',
    loading_search: '검색 중...',

    favorites: '즐겨찾기',
    debug_generate: '디버그 데이터 생성',
    back_to_agents: '에이전트 목록으로 돌아가기',
    search_button: '검색',
    search_placeholder: '플레이어 검색 (예: 사용자명#태그)',
    no_agents_configured: '구성된 에이전트 없음',
    loading_agents: '에이전트 로딩 중...',
    global_stats: '전체 통계',
    recent_matches: '최근 경기',
    no_matches_found: '경기를 찾을 수 없습니다.',
    manage_profile: '프로필 관리',
    logout: '로그아웃',
    open_tracker_gg: 'Tracker.gg 열기',
    copy_profile_link: '프로필 링크 복사',
    link_copied: '링크 복사 완료!',
    search_prompt: '플레이어를 검색하여 통계를 확인하세요',
    no_player_selected: '선택된 플레이어가 없습니다.',
    news_filter_all: '전체',
    news_filter_updates: '업데이트',
    news_filter_esports: 'e스포츠',
    news_filter_community: '커뮤니티',
    match_filter_all: '전체',
    match_filter_competitive: '경쟁전',
    match_filter_unrated: '일반전',
    match_filter_other: '기타',
    smart_rating: '스마트 평가',
    visual_indicators_desc: '평균 이하의 통계에 시각적 표시기를 표시합니다.',
    video_loop: '비디오 반복 재생',
    video_loop_desc: '요원 스킬 비디오를 자동으로 다시 재생합니다.',
    video_delay: '재생 지연 시간',
    back_to_profile: '프로필로 돌아가기',
    save_settings: '설정 저장',
    cancel: '취소',
    profile_privacy: '프로필 공개 설정',
    profile_privacy_desc: '다른 사용자에게 프로필 및 통계가 표시되는 방식을 관리합니다.',
    public_profile: '공개 프로필',
    public_profile_desc: '이름을 검색하는 모든 사용자에게 프로필과 통계가 공개됩니다.',
    private_profile: '비공개 프로필',
    private_profile_desc: '로그인한 상태에서만 본인의 통계를 확인할 수 있습니다. 다른 사용자에게는 프로필이 비공개임을 알리는 메시지가 표시됩니다.',
    stats_visibility: '통계 표시 여부',
    stats_visibility_desc: '내 프로필에서 보고 싶지 않은 통계의 선택을 해제하세요.',
    stat_dd: 'DDΔ / 라운드',
    apply_to_visitors: '방문자에게 적용',
    apply_to_visitors_desc: '선택하면 방문자도 나와 정확히 동일한 통계를 보게 됩니다.',
    ui_theme: 'UI 테마',
    ui_theme_desc: '애플리케이션의 시각적 테마를 선택하세요.',
    theme_dark: '다크',
    theme_light: '라이트',
    theme_midnight: '미드나잇',
    theme_crimson: '크림슨',
    theme_ocean: '오션',
    theme_custom: '사용자 지정',
    color_customization: '색상 사용자 지정',
    accent_color: '강조 색상',
    bg_color: '배경 색상',
    banner_customization: '배너 사용자 지정',
    banner_default: '기본값',
    see_more: '더보기',
    vertical_crop: '수직 자르기 (높이)',
    preview: '미리보기',
    avatar: '아바타',
    live_preview: '실시간 미리보기',
    live_preview_desc: '슬라이더를 드래그하여 위 프레임에서 이미지가 실시간으로 조정되는 것을 확인하세요.',
    footer_desc: 'Valorant 성능 추적 앱. 공식 라이엇 게임즈 API를 사용합니다.',
    footer_legal: 'Spycam은 Riot Games와 제휴하지 않으며, Riot Games 또는 Riot Games 자산의 제작 및 관리에 참여하는 사람들의 견해나 의견을 반영하지 않습니다. Riot Games 및 관련된 모든 자산은 Riot Games, Inc.의 상표 또는 등록 상표입니다.',
    role_duelist: '타격대',
    role_initiator: '척후대',
    role_controller: '전략가',
    role_sentinel: '감시자',
    logout_button: '로그아웃',
    add_favorite: '즐겨찾기에 추가',
    remove_favorite: '즐겨찾기에서 제거',
  },
};

/**
 * Récupère une traduction par sa clé pour une locale donnée.
 * Retourne la version française en fallback si la clé n'existe pas.
 */
export function t(key: string, locale: Locale = 'fr'): string {
  return (translations[locale] as any)?.[key] ?? (translations.fr as any)?.[key] ?? key;
}

export default translations;
