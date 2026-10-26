// Basit çizgi ikonlar (bağımlılık eklememek için elde)
type P = { className?: string; filled?: boolean };
const base = "fill-none stroke-current";

export const HomeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.7}><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.7}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}><path d="M12 5v14M5 12h14" /></svg>
);
export const UserIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.7}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const HeartIcon = ({ className, filled }: P) => (
  <svg viewBox="0 0 24 24" className={`${filled ? "fill-current" : "fill-none"} stroke-current ${className}`} strokeWidth={1.7}><path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.6 3.8 4.5 7 4.5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.2 0 5.3 3.1 4.2 6.2C19.5 15.4 12 20 12 20z" /></svg>
);
export const BookmarkIcon = ({ className, filled }: P) => (
  <svg viewBox="0 0 24 24" className={`${filled ? "fill-current" : "fill-none"} stroke-current ${className}`} strokeWidth={1.7}><path d="M6 3.5h12v17l-6-4-6 4z" /></svg>
);
export const FlagIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.7}><path d="M5 21V4m0 0h11l-2 4 2 4H5" /></svg>
);
export const BackIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}><path d="M15 5l-7 7 7 7" /></svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const GearIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.6}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const ArrowLeftIcon = BackIcon;
export const ArrowRightIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={1.8}><path d="M9 5l7 7-7 7" /></svg>
);
