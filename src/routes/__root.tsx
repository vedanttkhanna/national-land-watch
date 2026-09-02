import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NlamsShell } from "../components/nlams-shell";

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  useEffect(() => { reportLovableError(error, { boundary: "nlams_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background p-6"><div className="max-w-md text-center"><h1 className="text-xl font-bold text-primary">This page did not load</h1><p className="mt-2 text-sm text-muted-foreground">Please try again or return to the National Overview.</p><button onClick={reset} className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button></div></div>;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { title: "NLAMS | National Land Acquisition MIS" }, { name: "description", content: "Government dashboard for national land acquisition progress, compensation, rehabilitation, and statutory milestones." }, { name: "author", content: "National Land Acquisition & Management System" }, { property: "og:title", content: "NLAMS | National Land Acquisition MIS" }, { property: "og:description", content: "Government dashboard for national land acquisition progress, compensation, rehabilitation, and statutory milestones." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", href: "/favicon.ico", type: "image/x-icon" }] }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><NlamsShell><Outlet /></NlamsShell></QueryClientProvider>; }
