import nextwaveLogoSrc from "../assets/nextwave.png";

export function Logo({ className, variant }: { className?: string; variant?: "square" | "wide" }) {
  return <img src={nextwaveLogoSrc} alt="Nextwave logo" className={`${className ?? ""} object-contain`} />;
}
