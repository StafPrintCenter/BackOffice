export type LogoLoaderVariant = "mc" | "dc";

export interface LogoLoaderProps {
  variant?: LogoLoaderVariant;
  size?: number | string;
  animated?: boolean;
  loop?: boolean;
  duration?: number;
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
  shadow?: boolean;
  inkColor?: string;
  nibColor?: string;
  centerColor?: string;
  className?: string;
  textClassName?: string;
}

export const LOGO_LOADER_DEFAULT_TEXT = "Chargement…";
