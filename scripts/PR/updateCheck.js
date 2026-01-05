let initialCommit = null;

async function getLatestCommit() {
  const res = await fetch("https://api.github.com/repos/play-pokechill/play-pokechill.github.io/commits/main", {
    cache: "no-store"
  });
  const data = await res.json();
  return data.sha;
}

async function checkForUpdates() {
  const latest = await getLatestCommit();

  if (!initialCommit) {
    initialCommit = latest;
  } else if (initialCommit !== latest) {
    window.dispatchEvent(new Event("app-update-available"));
  }
}

// Initial setup
(async () => {
  initialCommit = await getLatestCommit();
})();
setInterval(checkForUpdates, 300000); // Check every 5 minutes   *API rate limited to 60 requests/hour so 12 is friendly*


window.addEventListener("app-update-available", () => {
  const banner = document.createElement("div");
  banner.textContent = "A new update is available. Refresh to update.";
  banner.style = "position:fixed;top:0;width:100%;background:#ff0;padding:10px;text-align:center;cursor:pointer;";
  banner.onclick = () => location.reload();
  document.body.appendChild(banner);
});
