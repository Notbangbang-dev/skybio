import {
  Github,
  Twitter,
  Instagram,
  Youtube,
  Twitch,
  Send,
  Mail,
  Globe,
  Link as LinkIcon,
  Music2,
  Disc3,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export const PLATFORM_ICONS: Record<string, LucideIcon> = {
  discord: MessageCircle,
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  spotify: Disc3,
  twitch: Twitch,
  telegram: Send,
  email: Mail,
  website: Globe,
  custom: LinkIcon,
};

export function platformIcon(platform: string): LucideIcon {
  return PLATFORM_ICONS[platform] ?? LinkIcon;
}
