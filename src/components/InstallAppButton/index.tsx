"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;

    const mobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    const ios = /iPhone|iPad|iPod/i.test(userAgent) && !("MSStream" in window);

    setIsMobile(mobile);
    setIsIOS(ios);

    // Already installed as PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (
        window.navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone === true;

    if (standalone) {
      setInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Don't show anything if already installed.
  if (installed) {
    return null;
  }

  const handleInstall = async () => {
    // Android / Chrome with native install prompt
    if (installPrompt) {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    // iPhone / Android fallback instructions
    setShowHelp(true);
  };

  /*
   * Desktop:
   * Only show when browser has given us the install prompt.
   */
  if (!isMobile && !installPrompt) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 md:w-auto"
      >
        📲 {isIOS ? "Add to Home Screen" : "Install Car Bazar"}
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Install Car Bazar
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add Guru Datta Car Bazar to your home screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="font-semibold text-orange-700">
                    On iPhone / iPad
                  </p>
                </div>

                <p>
                  <strong>1.</strong> Tap the <strong>Share</strong> button in
                  Safari.
                </p>

                <p>
                  <strong>2.</strong> Scroll down and select{" "}
                  <strong>Add to Home Screen</strong>.
                </p>

                <p>
                  <strong>3.</strong> Tap <strong>Add</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-sm text-slate-700">
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="font-semibold text-orange-700">On Android</p>
                </div>

                <p>
                  <strong>1.</strong> Open the browser menu <strong>⋮</strong>.
                </p>

                <p>
                  <strong>2.</strong> Select <strong>Add to Home screen</strong>{" "}
                  or <strong>Install app</strong>.
                </p>

                <p>
                  <strong>3.</strong> Confirm the installation.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
