import nextwaveLogo from "../assets/nextwave.png";

export function Logo({ className }: { className?: string }) {
  return <img src={nextwaveLogo} alt="Nextwave logo" className={`${className ?? ""} object-contain`} />;
}
