// Plain, serializable shapes passed from the server page to the client bio.

export interface BioProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  avatarStyle: string;
  avatarSize: number;
  location: string;
  pronouns: string;

  discordEnabled: boolean;
  discordUserId: string;
  discordShowActivity: boolean;

  bgType: string;
  bgUrl: string | null;
  bgColor: string;
  bgBlur: number;
  bgBrightness: number;
  bgOverlay: number;

  accent: string;
  accent2: string;
  textColor: string;
  displayFont: string;
  bodyFont: string;
  radius: number;
  cardOpacity: number;
  cardBlur: number;
  cardWidth: number;
  overlayColor: string;
  glowBehindCard: boolean;
  effectConfetti: boolean;
  footerText: string;

  nameEffect: string;
  effectParticles: boolean;
  effectStars: boolean;
  effectCursor: boolean;
  effectRain: boolean;
  effectTilt: boolean;
  effectGrain: boolean;
  particleColor: string;
  particleDensity: number;

  splashEnabled: boolean;
  enterText: string;

  musicEnabled: boolean;
  autoplay: boolean;
  volume: number;
  showVisualizer: boolean;
  loopTracks: boolean;

  showViews: boolean;
  views: number;
  badges: string[];
}

export interface BioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string | null;
}

export interface BioSocial {
  id: string;
  platform: string;
  label: string;
  url: string;
}
