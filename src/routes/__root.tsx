import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PwaRegister } from "@/components/PwaRegister";
import { BackToTop } from "@/components/BackToTop";
import { DEFAULT_LOCALE } from "@/i18n/config";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute inset-0 radial-glow" />
      <div className="relative max-w-md text-center">
        <h1 className="text-8xl font-bold gradient-text tracking-tight">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Back home
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-white glass-strong transition-all hover:bg-white/5"
          >
            Explore our work
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="absolute inset-0 radial-glow" />
      <div className="relative max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-hairline bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nextwave — Empowering Africa's Youth in Deep Tech" },
      {
        name: "description",
        content:
          "A youth-led deep-tech movement bridging Africa's gap in AI, biotechnology, and digital health, originating from Northern Nigeria.",
      },
      { property: "og:site_name", content: "Nextwave Infotech" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nextwave.com.ng" },
      { property: "og:title", content: "Nextwave — Empowering Africa's Youth in Deep Tech" },
      {
        property: "og:description",
        content:
          "A youth-led deep-tech movement bridging Africa's gap in AI, biotechnology, and digital health, originating from Northern Nigeria.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nextwave — Empowering Africa's Youth in Deep Tech" },
      {
        name: "twitter:description",
        content:
          "A youth-led deep-tech movement bridging Africa's gap in AI, biotechnology, and digital health, originating from Northern Nigeria.",
      },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "theme-color", content: "#0a0a12" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nextwave Infotech",
          url: "https://nextwave.com.ng",
          description:
            "A strategic, youth-driven ecosystem positioning the African continent at the forefront of AI, biotechnology, and digital health innovation, originating from Northern Nigeria.",
          knowsAbout: ["AI & Data Science", "Biotechnology & Health", "Digital Health Policy"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kawo, Kaduna",
            addressCountry: "NG",
          },
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "info@nextwave.com.ng",
          },
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const THEME_BOOT_SCRIPT = `
(function(){try{
  var s=localStorage.getItem('nextwave-theme');
  var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  var r=document.documentElement;
  if(d){r.classList.add('dark');r.style.colorScheme='dark';}
  else{r.classList.remove('dark');r.style.colorScheme='light';}
}catch(e){}})();
`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <BackToTop />
      <Analytics />
      <SpeedInsights />
    </QueryClientProvider>
  );
}
