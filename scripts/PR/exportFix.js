// Detect iOS in-app browsers (Instagram, TikTok, Facebook, Discord, etc.)
// These environments run inside WKWebView, which generally blocks file downloads.
function isIOSInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  const missingSafari = isIOS && !isSafari; // Safari includes "Safari" in UA; some in-app browsers remove it
  const isWKWebView = isIOS && !window.safari; // WKWebView does not expose window.safari
  return isIOS && (missingSafari || isWKWebView); // True if we're on iOS and not in real Safari.
}

// Check if the browser supports Blob downloads.
// Some environments (iOS private mode, in-app browsers) disable this.
function blobDownloadSupported() {
  try {
    const a = document.createElement("a");
    return typeof a.download !== "undefined";
  } catch {
    return false;
  }
}

// Export save data with fallbacks for restricted browsers.
async function exportData() {
  const raw = localStorage.getItem("gameData");
  if (!raw) {
    showTooltip("No gameData found");
    return;
  }

  const inApp = isIOSInAppBrowser();
  const blobOK = blobDownloadSupported();

  // Fallback for iOS in-app browsers or environments blocking downloads.
  if (inApp || !blobOK) {
    try {
      await navigator.clipboard.writeText(raw);
      showTooltip("Download blocked - save copied to clipboard.");
    } catch (clipErr) {
      console.error("Clipboard error:", clipErr);
    }
    return;
  }

  // Normal download path.
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Pokechill-${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showTooltip("Save file downloaded");
}

// Small floating tooltip for user feedback.
function showTooltip(message) {
  const tip = document.createElement("div");
  tip.textContent = message;

  Object.assign(tip.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    zIndex: 9999,
    opacity: 0,
    transition: "opacity 0.4s ease, transform 0.8s ease-out",
    pointerEvents: "none"
  });

  document.body.appendChild(tip);

  // Fade in + slight float up
  requestAnimationFrame(() => {
    tip.style.opacity = 1;
    tip.style.transform = "translateX(-50%) translateY(-10px)"; 
  });

  // Fade out + float further up
  setTimeout(() => {
    tip.style.opacity = 0;
    tip.style.transform = "translateX(-50%) translateY(-30px)";
    setTimeout(() => tip.remove(), 500);
  }, 1500);
}
