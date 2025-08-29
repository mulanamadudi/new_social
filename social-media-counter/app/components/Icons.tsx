import {
  PersonIcon as Person,
  PlayIcon as Play,
  HeartIcon as Heart,
  SocialAdIcon as SocialAd,
} from "@shopify/polaris-icons";

// Polaris-Icons direkt exportieren
export const PersonIcon = Person;
export const HeartIcon = Heart;
export const PlayIcon = Play;
export const PlatformsIcon = SocialAd;

// Eigene SVGs als <img> einbinden
// ACHTUNG: der Pfad muss öffentlich erreichbar sein, also über /public

export function FacebookIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/facebook.svg" alt="Facebook" {...props} style={{ fill: "#F97316" }} />;
}

export function PinterestIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/pinterest.svg" alt="Pinterest" {...props} />;
}

export function XIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/x.svg" alt="X" {...props} />;
}

export function TikTokIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/tiktok.svg" alt="TikTok" {...props} />;
}

export function YouTubeIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/youtube.svg" alt="YouTube" {...props} />;
}

export function InstagramIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/resources/instagram.svg" alt="Instagram" {...props} />;
}
