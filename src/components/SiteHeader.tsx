import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollProgress } from "./ScrollProgress";
import { Magnetic } from "./Magnetic";

const NAV = [
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/team", label: "Team" },
  { to: "/news", label: "Updates" },
  { to: "/contact", label: "Contact" },
] as const;

const linkClass = (active: boolean) =>
  `relative px-4 py-2 text-sm transition-colors rounded-full ${
    active
      ? "text-white bg-white/[0.08] border border-hairline"
      : "text-muted-foreground hover:text-white hover:bg-white/[0.03] border border-transparent"
  }`;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-2xl bg-background/70 border-b border-hairline shadow-[0_8px_40px_-16px_oklch(0 0 0/0.5)]"
          : "bg-transparent"
      }`}
    >
      <Link
        to="/projects"
        aria-label="Remote SIWES coming soon — learn more"
        className="group block border-b border-hairline/70 bg-gradient-to-r from-brand-purple/15 via-transparent to-brand-purple/10"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-6 py-2 lg:px-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/30 bg-brand-purple/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase text-brand-glow">
            <Sparkles className="h-3 w-3" />
            New
          </span>
          <span className="text-[13px] font-medium text-white/90">Remote SIWES coming soon</span>
          <ArrowRight className="h-3.5 w-3.5 text-brand-glow transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 lg:h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <motion.span
            whileHover={{ scale: 1.08, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Logo variant="square" className="h-7 w-7 lg:h-8 lg:w-8" />
          </motion.span>
          <span className="text-base lg:text-lg font-semibold tracking-tight text-white">
            Next<span className="text-brand-glow">Wave</span>
          </span>
        </Link>

        <nav
          className="hidden md:flex items-center gap-1 rounded-full glass px-2 py-1.5"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: linkClass(true) }}
              inactiveProps={{ className: linkClass(false) }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Magnetic strength={0.3}>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-shadow"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              Join Movement
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="text-foreground p-2 -mr-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-hairline bg-background/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: linkClass(true) }}
                  inactiveProps={{ className: linkClass(false) }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                Join Movement
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollProgress />
    </header>
  );
}
