import { useEffect, useRef, useState } from "react";

interface TurnstileOptions {
  sitekey: string;
  action: string;
  theme: "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      turnstileScriptPromise = null;
      reject(new Error("Turnstile script could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

interface TurnstileFieldProps {
  action: string;
  onTokenChange: (token: string | null) => void;
  resetSignal?: number;
}

export function TurnstileField({ action, onTokenChange, resetSignal }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);
  const previousResetSignal = useRef(resetSignal);
  const [unavailable, setUnavailable] = useState(false);
  const sitekey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY?.trim() ?? "";

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    let active = true;
    setUnavailable(false);
    callbackRef.current(null);

    if (!sitekey) {
      setUnavailable(true);
      return () => {
        active = false;
      };
    }

    void loadTurnstileScript()
      .then(() => {
        if (!active || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          action,
          theme: "auto",
          callback: (token) => callbackRef.current(token),
          "expired-callback": () => callbackRef.current(null),
          "error-callback": () => {
            callbackRef.current(null);
            setUnavailable(true);
          },
        });
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });

    return () => {
      active = false;
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, sitekey]);

  useEffect(() => {
    if (resetSignal === undefined || previousResetSignal.current === resetSignal) return;
    previousResetSignal.current = resetSignal;
    callbackRef.current(null);
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
  }, [resetSignal]);

  return (
    <div>
      <div ref={containerRef} />
      {unavailable && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          La vérification anti-robot est indisponible. Réessayez plus tard.
        </p>
      )}
    </div>
  );
}
