(() => {
  "use strict";

  const SAVE_KEY = "wonderpatch-save-v1";
  const OBJECTS = [
    { id: "duck", name: "Rubber Duck", emoji: "🦆", type: "creature", description: "A cheerful little visitor who loves a good beat." },
    { id: "drum", name: "Paper Drum", emoji: "🥁", type: "special", description: "A tiny drum with a very big sound." },
    { id: "cloud", name: "Rain Cloud", emoji: "🌧️", type: "nature", description: "A soft cloud that brings little surprises." },
    { id: "flower", name: "Folded Flower", emoji: "🌷", type: "nature", description: "A paper flower that perks up when something happens." },
    { id: "moon", name: "Sleepy Moon", emoji: "🌙", type: "special", description: "The moon is sleepy, but it can be cheered up." },
    { id: "umbrella", name: "Rainbow Umbrella", emoji: "🌂", type: "special", description: "A colorful shelter for unexpected weather." }
  ];

  const REACTIONS = [
    { id: "beatbox-duck", a: "duck", b: "drum", name: "Beatbox Duck", emoji: "🦆", type: "creature", description: "The duck found its rhythm. The whole garden wants to dance!", line: "Quack-ba-dum! The duck is the star of the garden.", mission: "moon-laugh" },
    { id: "rain-flower", a: "cloud", b: "flower", name: "Rain-Grown Flower", emoji: "🌺", type: "nature", description: "A gentle shower helps the folded flower bloom.", line: "A little rain made a lot of color.", mission: "wake-flowers" },
    { id: "dancing-moon", a: "moon", b: "drum", name: "Dancing Moon", emoji: "🌙", type: "special", description: "The moon hears the rhythm and starts a sky dance.", line: "Even the moon has happy feet!", mission: "moon-laugh" },
    { id: "upside-down-rain", a: "cloud", b: "umbrella", name: "Upside-down Rain", emoji: "☂️", type: "special", description: "The umbrella catches the rain and sends it back up.", line: "Who knew rain could bounce?", mission: "rainy-day" },
    { id: "flower-hat-duck", a: "flower", b: "duck", name: "Flower Hat Duck", emoji: "🌼", type: "creature", description: "The duck tries on a flower hat and feels fancy.", line: "Fashion has arrived in the garden.", mission: "dress-up" },
    { id: "rain-song", a: "drum", b: "cloud", name: "Rain Song", emoji: "🎵", type: "special", description: "The drum and cloud make a gentle rainy-day rhythm.", line: "Pitter-patter, boom-boom!", mission: "rainy-day" },
    { id: "moon-bloom", a: "moon", b: "flower", name: "Moonlit Bloom", emoji: "🌼", type: "nature", description: "The flower opens when the moon shines on it.", line: "A night-time flower for a night-time friend.", mission: "wake-flowers" },
    { id: "duck-umbrella", a: "duck", b: "umbrella", name: "Raincoat Duck", emoji: "🦆", type: "creature", description: "The duck is ready for a very fashionable rainy walk.", line: "Dry feathers, happy duck.", mission: "dress-up" },
    { id: "storm-drum", a: "umbrella", b: "drum", name: "Thunder Parade", emoji: "⛈️", type: "special", description: "A drumroll and an umbrella make a tiny pretend storm.", line: "The parade is loud, but nobody gets wet.", mission: "rainy-day" },
    { id: "moon-umbrella", a: "moon", b: "umbrella", name: "Moon Parasol", emoji: "🌙", type: "special", description: "The moon borrows an umbrella to shade its glow.", line: "A little shade for a very bright moon.", mission: "dress-up" }
  ];

  const MISSIONS = [
    { id: "moon-laugh", title: "Make the Moon Laugh", emoji: "🌙", description: "Try a musical object with the moon or help the duck find a rhythm.", target: ["beatbox-duck", "dancing-moon"], reward: "A moon sticker" },
    { id: "wake-flowers", title: "Wake Up the Flowers", emoji: "🌷", description: "Discover a new way to help a flower bloom.", target: ["rain-flower", "moon-bloom"], reward: "A flower sticker" },
    { id: "rainy-day", title: "A Very Strange Rainy Day", emoji: "🌧️", description: "Combine something with the cloud to discover a weather surprise.", target: ["upside-down-rain", "rain-song", "storm-drum"], reward: "A cloud sticker" },
    { id: "dress-up", title: "Garden Dress-Up", emoji: "🎩", description: "Help a garden friend find a surprising accessory.", target: ["flower-hat-duck", "duck-umbrella", "moon-umbrella"], reward: "A costume sticker" },
    { id: "anything-goes", title: "Make Something Unexpected", emoji: "✨", description: "Try any new combination and add it to your discovery book.", target: REACTIONS.map(r => r.id), reward: "A sparkle sticker" }
  ];

  const $ = (id) => document.getElementById(id);
  const state = {
    screen: "home", mode: "mission", playerCount: 2, players: ["Player 1", "Player 2", "Player 3", "Player 4"],
    currentPlayer: 0, missionId: "moon-laugh", selectedTrayId: null, selectedPlacedIds: [],
    placed: [], nextPlacedId: 1, discoveries: [], completedMissions: [], unlockedObjects: ["duck", "drum", "cloud", "flower", "moon", "umbrella"],
    settings: { sound: true, reduceMotion: false, largeText: false }, lastDiscovery: null, undoStack: []
  };

  function safeParse(raw) { try { return JSON.parse(raw); } catch { return null; } }
  function loadSave() {
    const saved = safeParse(localStorage.getItem(SAVE_KEY) || "null");
    if (!saved || typeof saved !== "object") return;
    if (Array.isArray(saved.discoveries)) state.discoveries = saved.discoveries.filter(id => REACTIONS.some(r => r.id === id));
    if (Array.isArray(saved.completedMissions)) state.completedMissions = saved.completedMissions.filter(id => MISSIONS.some(m => m.id === id));
    if (Array.isArray(saved.players)) state.players = saved.players.slice(0, 4).map((n, i) => String(n || `Player ${i + 1}`).slice(0, 20));
    if (Number.isInteger(saved.playerCount)) state.playerCount = Math.min(4, Math.max(1, saved.playerCount));
    if (saved.settings && typeof saved.settings === "object") {
      for (const key of Object.keys(state.settings)) if (typeof saved.settings[key] === "boolean") state.settings[key] = saved.settings[key];
    }
    if (Array.isArray(saved.placed)) {
      state.placed = saved.placed.filter(p => OBJECTS.some(o => o.id === p.objectId) && Number.isFinite(p.x) && Number.isFinite(p.y))
        .slice(0, 30).map(p => ({ id: Number(p.id) || 0, objectId: p.objectId, x: clamp(p.x, 5, 95), y: clamp(p.y, 8, 90) }));
      state.nextPlacedId = Math.max(1, ...state.placed.map(p => p.id + 1));
    }
    if (MISSIONS.some(m => m.id === saved.missionId)) state.missionId = saved.missionId;
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        discoveries: state.discoveries, completedMissions: state.completedMissions, players: state.players,
        playerCount: state.playerCount, settings: state.settings, placed: state.placed, missionId: state.missionId
      }));
      $("saveStatus").textContent = "Saved on this device";
    } catch (error) {
      $("saveStatus").textContent = "Save unavailable";
      console.error("WonderPatch save failed:", error);
      toast("Your browser could not save progress. Export a backup in Settings.");
    }
    renderHomeStats();
  }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function currentMission() { return MISSIONS.find(m => m.id === state.missionId) || MISSIONS[0]; }
  function objectById(id) { return OBJECTS.find(o => o.id === id); }
  function reactionById(id) { return REACTIONS.find(r => r.id === id); }
  function placedById(id) { return state.placed.find(p => p.id === id); }
  function reactionFor(a, b) { return REACTIONS.find(r => (r.a === a && r.b === b) || (r.a === b && r.b === a)); }
  function toast(message) {
    const el = $("toast"); el.textContent = message; el.classList.add("visible");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("visible"), 2600);
  }
  function playTone(freq = 620) {
    if (!state.settings.sound) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq; gain.gain.setValueAtTime(.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .17);
      osc.onended = () => ctx.close();
    } catch (e) { /* Audio is an optional enhancement; gameplay still works. */ }
  }
  function showScreen(name) {
    state.screen = name;
    document.querySelectorAll(".screen").forEach(el => el.classList.toggle("active", el.id === `${name}Screen`));
    if (name === "home") renderHomeStats();
    if (name === "setup") renderPlayers();
    if (name === "game") renderGame();
    if (name === "collection") renderCollection();
    if (name === "settings") renderSettings();
    window.scrollTo({ top: 0, behavior: state.settings.reduceMotion ? "auto" : "smooth" });
  }
  function renderHomeStats() {
    $("homeDiscoveries").textContent = state.discoveries.length;
    $("homeMissions").textContent = state.completedMissions.length;
  }
  function renderPlayers() {
    document.querySelectorAll("[data-player-count]").forEach(btn => btn.classList.toggle("selected", Number(btn.dataset.playerCount) === state.playerCount));
    $("playerNames").innerHTML = "";
    for (let i = 0; i < state.playerCount; i++) {
      const row = document.createElement("label"); row.className = "player-name-row";
      const icon = document.createElement("span"); icon.textContent = ["🌼", "🐝", "🍄", "🦋"][i]; icon.setAttribute("aria-hidden", "true");
      const input = document.createElement("input"); input.type = "text"; input.maxLength = 20; input.value = state.players[i] || `Player ${i + 1}`; input.setAttribute("aria-label", `Player ${i + 1} name`);
      input.addEventListener("change", () => { state.players[i] = input.value.trim().slice(0, 20) || `Player ${i + 1}`; save(); renderTurn(); });
      row.append(icon, input); $("playerNames").append(row);
    }
  }
  function renderTurn() {
    const name = state.players[state.currentPlayer] || `Player ${state.currentPlayer + 1}`;
    $("turnPill").textContent = `🌼 ${name}'s turn`;
  }
  function renderMission() {
    const mission = currentMission();
    $("missionBanner").hidden = state.mode !== "mission";
    $("missionTitle").textContent = mission.title;
    $("missionDescription").textContent = mission.description;
    $("missionProgress").textContent = state.completedMissions.includes(mission.id) ? "Done!" : `${mission.target.filter(id => state.discoveries.includes(id)).length}/${mission.target.length > 1 ? 1 : mission.target.length}`;
    $("missionBanner").querySelector(".mission-emoji").textContent = mission.emoji;
    $("modeEyebrow").textContent = state.mode === "mission" ? "FAMILY MISSION" : "FREE CREATE";
    $("gameTitle").textContent = state.mode === "mission" ? "Let's make something!" : "Your Garden";
  }
  function renderTray() {
    const tray = $("objectTray"); tray.innerHTML = "";
    OBJECTS.forEach(obj => {
      const btn = document.createElement("button"); btn.className = `object-card${state.selectedTrayId === obj.id ? " selected" : ""}`;
      btn.type = "button"; btn.setAttribute("aria-pressed", String(state.selectedTrayId === obj.id));
      btn.innerHTML = `<span class="object-emoji" aria-hidden="true">${obj.emoji}</span><small>${escapeHTML(obj.name)}</small>`;
      btn.addEventListener("click", () => {
        state.selectedTrayId = state.selectedTrayId === obj.id ? null : obj.id;
        $("selectedObjectLabel").textContent = state.selectedTrayId ? `${objectById(state.selectedTrayId).emoji} ${objectById(state.selectedTrayId).name} selected — tap an open spot in the garden.` : "Nothing selected";
        renderTray(); updateBoardTip();
      });
      tray.append(btn);
    });
  }
  function renderPlaced() {
    const root = $("placedObjects"); root.innerHTML = "";
    state.placed.forEach(p => {
      const obj = objectById(p.objectId); if (!obj) return;
      const btn = document.createElement("button"); btn.type = "button"; btn.className = `placed-object${state.selectedPlacedIds.includes(p.id) ? " selected" : ""}`;
      btn.style.left = `${p.x}%`; btn.style.top = `${p.y}%`; btn.textContent = obj.emoji; btn.title = `${obj.name}. Tap to select for a combination.`;
      btn.setAttribute("aria-label", `${obj.name}, tap to select`);
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (state.selectedTrayId) { placeObjectAt(p.x, p.y); return; }
        togglePlacedSelection(p.id);
      });
      root.append(btn);
    });
    renderPair();
  }
  function renderPair() {
    const labels = state.selectedPlacedIds.map(id => {
      const p = placedById(id); const obj = p && objectById(p.objectId); return obj ? `${obj.emoji} ${obj.name}` : null;
    }).filter(Boolean);
    $("selectedPair").innerHTML = "";
    for (let i = 0; i < 2; i++) {
      const span = document.createElement("span"); span.textContent = labels[i] || (i === 0 ? "＋ First object" : "＋ Second object"); $("selectedPair").append(span);
    }
    $("tryButton").disabled = state.selectedPlacedIds.length !== 2;
  }
  function updateBoardTip() {
    $("boardTip").textContent = state.selectedTrayId ? `Tap an open spot to place ${objectById(state.selectedTrayId).name}.` : "Choose an object below, then tap the garden to place it.";
  }
  function renderGame() {
    renderMission(); renderTurn(); renderTray(); renderPlaced(); updateBoardTip();
    $("gameMessage").textContent = "";
  }
  function renderCollection(filter = "all") {
    $("collectionCount").textContent = `${state.discoveries.length} of ${REACTIONS.length} discoveries found`;
    $("collectionProgress").style.width = `${state.discoveries.length / REACTIONS.length * 100}%`;
    document.querySelectorAll("[data-filter]").forEach(btn => btn.classList.toggle("selected", btn.dataset.filter === filter));
    const grid = $("discoveryGrid"); grid.innerHTML = "";
    REACTIONS.filter(r => filter === "all" || r.type === filter).forEach(r => {
      const found = state.discoveries.includes(r.id);
      const card = document.createElement("article"); card.className = `discovery-card${found ? "" : " locked"}`;
      const art = document.createElement("div"); art.className = "discovery-art"; art.textContent = found ? r.emoji : "❔";
      const title = document.createElement("h3"); title.textContent = found ? r.name : "Not discovered yet";
      const desc = document.createElement("p"); desc.textContent = found ? r.description : "Try new object combinations to find this surprise.";
      card.append(art, title, desc); grid.append(card);
    });
    if (!grid.children.length) grid.innerHTML = '<p class="muted">No discoveries in this category yet.</p>';
  }
  function renderSettings() {
    $("soundToggle").checked = state.settings.sound; $("motionToggle").checked = state.settings.reduceMotion; $("largeTextToggle").checked = state.settings.largeText;
  }
  function applySettings() {
    document.body.classList.toggle("reduce-motion", state.settings.reduceMotion);
    document.body.classList.toggle("large-text", state.settings.largeText);
  }
  function snapshot() { state.undoStack.push(JSON.stringify(state.placed)); if (state.undoStack.length > 20) state.undoStack.shift(); }
  function placeObjectAt(x, y) {
    if (!state.selectedTrayId) return;
    if (state.placed.length >= 30) { toast("Your garden is full! Remove an object to make room."); return; }
    snapshot();
    state.placed.push({ id: state.nextPlacedId++, objectId: state.selectedTrayId, x: clamp(x, 7, 93), y: clamp(y, 15, 84) });
    state.selectedTrayId = null; $("selectedObjectLabel").textContent = "Object placed! Choose another one or try a combination.";
    state.selectedPlacedIds = []; renderTray(); renderPlaced(); updateBoardTip(); save(); playTone(520);
  }
  function togglePlacedSelection(id) {
    if (state.selectedPlacedIds.includes(id)) state.selectedPlacedIds = state.selectedPlacedIds.filter(x => x !== id);
    else {
      if (state.selectedPlacedIds.length >= 2) state.selectedPlacedIds.shift();
      state.selectedPlacedIds.push(id);
    }
    renderPlaced(); updateBoardTip();
    const objs = state.selectedPlacedIds.map(pid => objectById(placedById(pid)?.objectId)).filter(Boolean);
    $("gameMessage").textContent = objs.length ? `Selected: ${objs.map(o => o.name).join(" + ")}` : "";
  }
  function tryCombination() {
    if (state.selectedPlacedIds.length !== 2) return;
    const p1 = placedById(state.selectedPlacedIds[0]); const p2 = placedById(state.selectedPlacedIds[1]);
    if (!p1 || !p2) { state.selectedPlacedIds = []; renderPlaced(); return; }
    const reaction = reactionFor(p1.objectId, p2.objectId);
    if (!reaction) {
      $("gameMessage").textContent = "Not every pair has a special reaction yet. Try another combination!";
      playTone(230); return;
    }
    const isNew = !state.discoveries.includes(reaction.id);
    if (isNew) state.discoveries.push(reaction.id);
    state.lastDiscovery = reaction;
    if (state.mode === "mission") {
      const mission = currentMission();
      if (mission.target.includes(reaction.id) && !state.completedMissions.includes(mission.id)) {
        state.completedMissions.push(mission.id);
        save();
        openModal({ emoji: reaction.emoji, eyebrow: "MISSION COMPLETE!", title: `${mission.title} — done!`, text: `${reaction.line} You found ${reaction.name}. ${mission.reward} earned!`, primary: "Keep playing", secondary: "Choose next mission" ,
          onPrimary: () => { closeModal(); state.currentPlayer = (state.currentPlayer + 1) % state.playerCount; state.selectedPlacedIds = []; renderGame(); },
          onSecondary: () => { closeModal(); chooseMission(); } });
        playTone(820); renderPlaced(); return;
      }
    }
    save(); renderPlaced();
    openModal({ emoji: reaction.emoji, eyebrow: isNew ? "NEW DISCOVERY!" : "A FUN REACTION", title: reaction.name, text: reaction.description + " " + reaction.line,
      primary: isNew ? "Add to my book" : "Back to garden", onPrimary: () => { closeModal(); state.currentPlayer = (state.currentPlayer + 1) % state.playerCount; state.selectedPlacedIds = []; renderGame(); } });
    playTone(isNew ? 850 : 610);
  }
  function openModal({ emoji = "✨", eyebrow = "WONDERPATCH", title = "Wonderful!", text = "", primary = "Continue", secondary = null, onPrimary = null, onSecondary = null }) {
    $("modalIllustration").textContent = emoji; $("modalEyebrow").textContent = eyebrow; $("modalTitle").textContent = title; $("modalText").textContent = text;
    const actions = $("modalActions"); actions.innerHTML = "";
    const primaryBtn = document.createElement("button"); primaryBtn.className = "button primary"; primaryBtn.textContent = primary;
    primaryBtn.addEventListener("click", onPrimary || closeModal); actions.append(primaryBtn);
    if (secondary) { const secondaryBtn = document.createElement("button"); secondaryBtn.className = "button secondary"; secondaryBtn.textContent = secondary; secondaryBtn.addEventListener("click", onSecondary || closeModal); actions.append(secondaryBtn); }
    $("modalBackdrop").hidden = false; primaryBtn.focus();
  }
  function closeModal() { $("modalBackdrop").hidden = true; }
  function chooseMission() {
    const next = MISSIONS.find(m => !state.completedMissions.includes(m.id)) || MISSIONS[0];
    state.missionId = next.id; state.mode = "mission"; state.selectedPlacedIds = []; save(); showScreen("game");
  }
  function clearBoard() {
    if (!state.placed.length) { toast("Your garden is already clear."); return; }
    snapshot(); state.placed = []; state.selectedPlacedIds = []; state.selectedTrayId = null;
    renderGame(); save(); toast("The movable objects were cleared. Your discoveries are safe.");
  }
  function undo() {
    const prev = state.undoStack.pop();
    if (!prev) { toast("Nothing to undo yet."); return; }
    const restored = safeParse(prev);
    if (Array.isArray(restored)) { state.placed = restored; state.selectedPlacedIds = []; renderGame(); save(); toast("Last garden change undone."); }
  }
  function exportSave() {
    const data = { version: 1, exportedAt: new Date().toISOString(), discoveries: state.discoveries, completedMissions: state.completedMissions, players: state.players, playerCount: state.playerCount, settings: state.settings, placed: state.placed, missionId: state.missionId };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wonderpatch-save.json"; document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast("Save backup exported.");
  }
  function importSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = safeParse(String(reader.result || ""));
      if (!data || data.version !== 1 || !Array.isArray(data.discoveries) || !Array.isArray(data.completedMissions)) { toast("That file is not a valid WonderPatch save."); return; }
      state.discoveries = data.discoveries.filter(id => REACTIONS.some(r => r.id === id));
      state.completedMissions = data.completedMissions.filter(id => MISSIONS.some(m => m.id === id));
      if (Array.isArray(data.players)) state.players = data.players.slice(0, 4).map((n, i) => String(n || `Player ${i + 1}`).slice(0, 20));
      if (Number.isInteger(data.playerCount)) state.playerCount = clamp(data.playerCount, 1, 4);
      if (data.settings && typeof data.settings === "object") Object.keys(state.settings).forEach(k => { if (typeof data.settings[k] === "boolean") state.settings[k] = data.settings[k]; });
      if (Array.isArray(data.placed)) state.placed = data.placed.filter(p => OBJECTS.some(o => o.id === p.objectId) && Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, 30);
      state.nextPlacedId = Math.max(1, ...state.placed.map(p => p.id + 1));
      if (MISSIONS.some(m => m.id === data.missionId)) state.missionId = data.missionId;
      applySettings(); save(); renderSettings(); toast("Save imported successfully.");
    };
    reader.onerror = () => toast("Could not read that save file.");
    reader.readAsText(file);
  }
  function resetProgress() {
    if (!window.confirm("Reset all WonderPatch progress on this device? Export a save first if you want a backup.")) return;
    state.discoveries = []; state.completedMissions = []; state.placed = []; state.nextPlacedId = 1; state.undoStack = []; state.currentPlayer = 0;
    state.missionId = MISSIONS[0].id; state.players = ["Player 1", "Player 2", "Player 3", "Player 4"]; state.playerCount = 2;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { console.warn(e); }
    save(); applySettings(); renderSettings(); showScreen("home"); toast("WonderPatch is fresh and ready.");
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]); }

  // Navigation and top-level actions
  document.querySelectorAll("[data-nav]").forEach(btn => btn.addEventListener("click", e => { e.preventDefault(); showScreen(btn.dataset.nav); }));
  $("playBtn").addEventListener("click", () => showScreen("setup"));
  $("freeCreateBtn").addEventListener("click", () => { state.mode = "free"; state.selectedPlacedIds = []; showScreen("setup"); });
  $("missionsCard").addEventListener("click", () => showScreen("setup"));
  $("collectionCard").addEventListener("click", () => showScreen("collection"));
  $("gardenCard").addEventListener("click", () => { state.mode = "free"; showScreen("game"); });
  $("settingsBtn").addEventListener("click", () => showScreen("settings"));
  document.querySelectorAll("[data-player-count]").forEach(btn => btn.addEventListener("click", () => { state.playerCount = Number(btn.dataset.playerCount); state.currentPlayer = 0; renderPlayers(); save(); }));
  $("missionModeBtn").addEventListener("click", () => { state.mode = "mission"; showScreen("game"); });
  $("freeModeBtn").addEventListener("click", () => { state.mode = "free"; showScreen("game"); });
  $("gardenBoard").addEventListener("click", e => {
    if (!state.selectedTrayId) return;
    const rect = $("gardenBoard").getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100; const y = (e.clientY - rect.top) / rect.height * 100;
    placeObjectAt(x, y);
  });
  $("tryButton").addEventListener("click", tryCombination);
  $("undoBtn").addEventListener("click", undo);
  $("clearBoardBtn").addEventListener("click", clearBoard);
  $("changeMissionBtn").addEventListener("click", chooseMission);
  $("modalClose").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", e => { if (e.target === $("modalBackdrop")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("modalBackdrop").hidden) closeModal(); });
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => renderCollection(btn.dataset.filter)));
  $("soundToggle").addEventListener("change", e => { state.settings.sound = e.target.checked; save(); });
  $("motionToggle").addEventListener("change", e => { state.settings.reduceMotion = e.target.checked; applySettings(); save(); });
  $("largeTextToggle").addEventListener("change", e => { state.settings.largeText = e.target.checked; applySettings(); save(); });
  $("exportBtn").addEventListener("click", exportSave);
  $("importInput").addEventListener("change", e => { importSave(e.target.files && e.target.files[0]); e.target.value = ""; });
  $("resetBtn").addEventListener("click", resetProgress);

  loadSave(); applySettings(); renderHomeStats(); renderSettings(); renderPlayers();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(err => console.info("Offline caching unavailable:", err)));
  }
})();
