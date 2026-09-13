import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/layout/app-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth/provider";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { APP_AUTHOR, APP_NAME, APP_TAGLINE } from "@/lib/inventory/fields";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${APP_NAME} — ${APP_TAGLINE}` },
      { name: "description", content: APP_TAGLINE },
      { name: "author", content: APP_AUTHOR },
      { name: "theme-color", content: "#0b1014" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
});

function Root() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <html lang="fa" dir="rtl" className="theme-dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider delayDuration={200}>
                <AppShell>
                  <Outlet />
                </AppShell>
                <Toaster
                  theme="system"
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-fg)",
                      fontFamily: "Vazirmatn, sans-serif",
                    },
                  }}
                />
              </TooltipProvider>
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
