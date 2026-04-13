import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export default function useGoogleIdentity({
  enabled,
  clientId,
  theme,
  onCredential,
  onScriptError,
}) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || !clientId) {
      return undefined;
    }

    let cancelled = false;

    const initializeGoogleButton = () => {
      if (
        cancelled ||
        !buttonRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onCredential?.(response.credential);
            return;
          }

          onScriptError?.("Google did not return a usable sign-in credential.");
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: theme === "dark" ? "filled_black" : "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: Math.max(buttonRef.current.offsetWidth, 320),
      });

      setReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    let script = document.getElementById(GOOGLE_SCRIPT_ID);

    const handleLoad = () => initializeGoogleButton();
    const handleError = () => {
      setReady(false);
      onScriptError?.("Google Sign-In could not be loaded right now.");
    };

    if (!script) {
      script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, [clientId, enabled, onCredential, onScriptError, theme]);

  return { buttonRef, ready: Boolean(enabled && clientId && ready) };
}
