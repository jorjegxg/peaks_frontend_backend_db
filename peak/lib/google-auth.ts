const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

let scriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              width?: number;
              type?: string;
            }
          ) => void;
          revoke: (hint: string, done?: () => void) => void;
        };
      };
    };
  }
}

export function loadGsiScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load GSI script on server"));
      return;
    }
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existing) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

export function isGoogleAuthConfigured(): boolean {
  return GOOGLE_CLIENT_ID.length > 0;
}

export function getGoogleClientId(): string {
  return GOOGLE_CLIENT_ID;
}

let initialized = false;

export async function initGoogleIdentityServices(
  onCredential: (credential: string) => void
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  }
  await loadGsiScript();
  const google = window.google;
  if (!google) throw new Error("Google Identity Services failed to load");

  if (!initialized) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        if (response.credential) {
          onCredential(response.credential);
        }
      },
    });
    initialized = true;
  }
}

/**
 * Renders a Google Sign-In button into the given container element.
 * NOTE: Call `initGoogleIdentityServices` first.
 */
export async function renderGoogleSignInButton(
  container: HTMLElement
): Promise<void> {
  await loadGsiScript();
  const google = window.google;
  if (!google) throw new Error("Google Identity Services failed to load");

  google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    text: "signin_with",
    width: 280,
  });
}
