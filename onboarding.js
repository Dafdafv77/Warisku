/* First-login tour for Warisku. Completion is stored in Supabase user metadata
   when possible, with a per-user localStorage fallback for this browser. */
(() => {
  if (window.__WARISKU_ONBOARDING_INITIALIZED__) return;
  window.__WARISKU_ONBOARDING_INITIALIZED__ = true;

  const COMPLETE_FIELD = "warisku_onboarding_completed_at";
  const storageKey = (userId) => `warisku:onboarding:v1:${userId}`;
  const slides = [
    {
      kicker: "01 · Kenali Warisku",
      title: "Kesiapan keluarga dimulai dari informasi yang tepat.",
      body: "Warisku membantu Anda menghubungkan aset, lokasi dokumen, kewajiban, orang tepercaya, dan instruksi keluarga. Bukan sekadar folder penyimpanan tambahan.",
      points: ["Mulai dari daftar aset, tidak harus memindahkan semua file", "Informasi disusun agar keluarga tahu langkah berikutnya"],
      artClass: "wo-art-1",
      art: `<div class="wo-art-inner"><div class="wo-map-card"><div class="wo-map-head"><div><div class="wo-map-title">Family Asset Map</div><div class="wo-map-sub">Ringkasan aset dan informasi penting</div></div><span class="wo-status">TERSTRUKTUR</span></div><div class="wo-map-nodes"><div class="wo-node"><div class="wo-node-icon">⌂</div><strong>Properti</strong><small>Lokasi dokumen</small></div><div class="wo-node"><div class="wo-node-icon">▤</div><strong>Polis & investasi</strong><small>Institusi terkait</small></div><div class="wo-node"><div class="wo-node-icon">↗</div><strong>Bisnis & aset</strong><small>Pemilik / referensi</small></div><div class="wo-node"><div class="wo-node-icon">◎</div><strong>Kontak keluarga</strong><small>Orang yang dihubungi</small></div></div></div></div>`
    },
    {
      kicker: "02 · Peta, bukan tumpukan file",
      title: "Hubungkan dokumen dengan tindakan yang perlu dilakukan.",
      body: "Catat apa yang Anda miliki, di mana buktinya berada, kewajiban yang terkait, serta siapa yang perlu dihubungi. Dokumen boleh tetap tersimpan di Google Drive atau tempat lain.",
      points: ["Tidak harus migrasi semua dokumen ke Warisku", "Lihat bagian yang belum lengkap melalui readiness check"],
      artClass: "wo-art-2",
      art: `<div class="wo-art-inner wo-stack"><div class="wo-asset-row"><div class="wo-asset-icon">⌂</div><div class="wo-asset-text"><strong>Rumah keluarga</strong><small>Sertifikat · lokasi file tercatat</small></div><span class="wo-asset-state">TERCATAT</span></div><div class="wo-asset-row"><div class="wo-asset-icon">▣</div><div class="wo-asset-text"><strong>Asuransi jiwa</strong><small>Kontak penyedia · panduan klaim</small></div><span class="wo-asset-state">TERCATAT</span></div><div class="wo-asset-row"><div class="wo-asset-icon">↗</div><div class="wo-asset-text"><strong>Usaha keluarga</strong><small>Dokumen kepemilikan</small></div><span class="wo-asset-state" style="background:#fbefdc;color:#92703a">TINJAU</span></div><div class="wo-link-note"><strong style="font-size:13px">↗</strong><span>Warisku menghubungkan catatan, referensi dokumen, dan langkah tindak lanjut.</span></div></div>`
    },
    {
      kicker: "03 · Siap ketika dibutuhkan",
      title: "Siapkan protokol keluarga, bukan pembukaan otomatis.",
      body: "Tentukan kontak tepercaya, lakukan pemeriksaan berkala, dan siapkan proses verifikasi. Jika Anda tidak merespons, itu hanya memulai pemeriksaan—bukan bukti kematian atau izin membuka vault.",
      points: ["Akses diberikan bertahap sesuai otorisasi", "Informasi sensitif tidak otomatis dibuka hanya karena timer habis"],
      artClass: "wo-art-3",
      art: `<div class="wo-art-inner"><div class="wo-protocol"><div class="wo-protocol-head"><strong>Protokol kondisi khusus</strong><span>AKSES TERKONTROL</span></div><div class="wo-flow-step"><div class="wo-flow-num">1</div><div><strong>Konfirmasi berkala</strong><small>Pengingat kepada pemilik, dengan grace period.</small></div></div><div class="wo-flow-step"><div class="wo-flow-num">2</div><div><strong>Verifikasi dan peninjauan</strong><small>Bukti, identitas, dan dasar permintaan diperiksa.</small></div></div><div class="wo-flow-step"><div class="wo-flow-num">3</div><div><strong>Akses sesuai persetujuan</strong><small>Hanya informasi yang telah diotorisasi yang dapat dibagikan.</small></div></div><div class="wo-warning">Kematian, ketidakmampuan, dan tidak merespons adalah kondisi berbeda; masing-masing memerlukan prosedur yang sesuai.</div></div></div>`
    }
  ];

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  const root = document.createElement("div");
  root.id = "wariskuOnboarding";
  root.className = "wo-overlay";
  root.hidden = true;
  root.innerHTML = `
    <div class="wo-wrap">
      <section class="wo-dialog" role="dialog" aria-modal="true" aria-label="Panduan singkat Warisku" tabindex="-1">
        <header class="wo-top">
          <div class="wo-brand"><div class="wo-mark" aria-hidden="true">W</div><div><strong>warisku</strong><small>family continuity</small></div></div>
          <div class="wo-topright"><span class="wo-overline">PANDUAN SINGKAT</span><button type="button" class="wo-close" id="woClose" aria-label="Tutup panduan">×</button></div>
        </header>
        <div class="wo-viewport" id="woViewport"><div class="wo-track" id="woTrack"></div></div>
        <footer class="wo-controls">
          <div class="wo-controls-left"><button type="button" class="wo-skip" id="woSkip">Lewati panduan</button><span class="wo-count" id="woCount">01 / 03</span></div>
          <div class="wo-controls-right"><button type="button" class="wo-prev" id="woPrev" disabled>← Kembali</button><button type="button" class="wo-next" id="woNext">Lanjut <span aria-hidden="true">→</span></button></div>
        </footer>
      </section>
      <nav class="wo-dots" id="woDots" aria-label="Pilih halaman panduan"></nav>
    </div>`;
  document.body.appendChild(root);

  const track = root.querySelector("#woTrack");
  const viewport = root.querySelector("#woViewport");
  const prevButton = root.querySelector("#woPrev");
  const nextButton = root.querySelector("#woNext");
  const count = root.querySelector("#woCount");
  const dotsContainer = root.querySelector("#woDots");
  const dialog = root.querySelector("[role='dialog']");
  let activeIndex = 0;
  let activeUser = null;
  let activeSupabase = null;
  let touchStartX = null;
  let returnFocusTo = null;
  let savePending = false;

  track.innerHTML = slides.map((slide, index) => `
    <article class="wo-slide" aria-roledescription="slide" aria-label="Halaman ${index + 1} dari ${slides.length}">
      <div class="wo-copy">
        <div class="wo-kicker">${esc(slide.kicker)}</div>
        <h2 ${index === 0 ? 'id="woTitle"' : ""}>${esc(slide.title)}</h2>
        <p ${index === 0 ? 'id="woBody"' : ""}>${esc(slide.body)}</p>
        <ul class="wo-points">${slide.points.map(point => `<li><span class="wo-check" aria-hidden="true">✓</span><span>${esc(point)}</span></li>`).join("")}</ul>
      </div>
      <div class="wo-art ${slide.artClass}" aria-hidden="true">${slide.art}</div>
    </article>`).join("");
  dotsContainer.innerHTML = slides.map((slide, index) => `<button type="button" class="wo-dot${index === 0 ? "" : ""}" data-wo-dot="${index}" aria-label="Buka halaman ${index + 1}"${index === 0 ? ' aria-current="step"' : ""}></button>`).join("") + `<span class="wo-dots-label">Panduan Warisku</span>`;

  function readLocalCompletion(userId) {
    try { return localStorage.getItem(storageKey(userId)) === "done"; }
    catch { return false; }
  }

  function writeLocalCompletion(userId) {
    try { localStorage.setItem(storageKey(userId), "done"); }
    catch { /* Metadata write below can still persist across devices. */ }
  }

  function updateSlide() {
    track.style.transform = `translate3d(-${activeIndex * (100 / slides.length)}%,0,0)`;
    dialog.setAttribute("aria-label", slides[activeIndex].title);
    count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    prevButton.disabled = activeIndex === 0;
    nextButton.innerHTML = activeIndex === slides.length - 1 ? 'Mulai menggunakan Warisku <span aria-hidden="true">→</span>' : 'Lanjut <span aria-hidden="true">→</span>';
    dotsContainer.querySelectorAll("[data-wo-dot]").forEach((dot, index) => {
      if (index === activeIndex) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    track.querySelectorAll(".wo-slide").forEach((slide, index) => {
      slide.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
    });
  }

  function openOnboarding({ reset = true } = {}) {
    if (reset) activeIndex = 0;
    const focused = document.activeElement;
    const focusIsInAuth = focused instanceof HTMLElement && focused.closest("#authView");
    returnFocusTo = focusIsInAuth ? (document.getElementById("reopenOnboardingBtn") || document.querySelector('.navstep[data-go="1"]')) : focused;
    root.hidden = false;
    requestAnimationFrame(() => {
      root.classList.add("wo-open");
      updateSlide();
      dialog.focus({ preventScroll: true });
      root.querySelector("#woClose").focus({ preventScroll: true });
    });
    document.body.classList.add("wo-body-lock");
  }

  async function saveCompletion() {
    const user = activeUser;
    if (!user?.id) return;
    writeLocalCompletion(user.id);
    if (savePending || user.user_metadata?.[COMPLETE_FIELD]) return;
    savePending = true;
    try {
      if (activeSupabase?.auth?.updateUser) {
        const completedAt = new Date().toISOString();
        const { error } = await activeSupabase.auth.updateUser({
          data: { ...(user.user_metadata || {}), [COMPLETE_FIELD]: completedAt }
        });
        if (error) console.warn("Warisku onboarding completion stored locally; metadata sync failed.", error.message);
        else activeUser = { ...user, user_metadata: { ...(user.user_metadata || {}), [COMPLETE_FIELD]: completedAt } };
      }
    } catch (error) {
      console.warn("Warisku onboarding metadata sync failed; local fallback retained.", error);
    } finally {
      savePending = false;
    }
  }

  async function closeOnboarding({ goToDashboard = false, restoreFocus = true } = {}) {
    if (root.hidden) return;
    // Persist the local flag immediately, but never hold the UI open while a metadata update waits on the network.
    void saveCompletion();
    root.classList.remove("wo-open");
    document.body.classList.remove("wo-body-lock");
    window.setTimeout(() => { root.hidden = true; }, 240);
    if (goToDashboard) {
      document.querySelector('.navstep[data-go="1"]')?.click();
    }
    if (restoreFocus && returnFocusTo instanceof HTMLElement) {
      window.setTimeout(() => returnFocusTo?.focus?.({ preventScroll: true }), 260);
    }
  }

  function hasCompleted(user) {
    return Boolean(user?.user_metadata?.[COMPLETE_FIELD]) || (user?.id && readLocalCompletion(user.id));
  }

  function next() {
    if (activeIndex < slides.length - 1) {
      activeIndex += 1;
      updateSlide();
    } else {
      closeOnboarding({ goToDashboard: true });
    }
  }

  prevButton.addEventListener("click", () => {
    if (activeIndex > 0) { activeIndex -= 1; updateSlide(); }
  });
  nextButton.addEventListener("click", next);
  root.querySelector("#woClose").addEventListener("click", () => closeOnboarding());
  root.querySelector("#woSkip").addEventListener("click", () => closeOnboarding());
  dotsContainer.querySelectorAll("[data-wo-dot]").forEach(dot => dot.addEventListener("click", () => {
    activeIndex = Number(dot.dataset.woDot);
    updateSlide();
  }));
  root.addEventListener("click", event => {
    if (event.target === root) closeOnboarding();
  });
  viewport.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches?.[0]?.clientX ?? null;
  }, { passive: true });
  viewport.addEventListener("touchend", event => {
    if (touchStartX === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    touchStartX = null;
    if (delta < -45 && activeIndex < slides.length - 1) { activeIndex += 1; updateSlide(); }
    else if (delta > 45 && activeIndex > 0) { activeIndex -= 1; updateSlide(); }
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (root.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closeOnboarding(); }
    else if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    else if (event.key === "ArrowLeft" && activeIndex > 0) { event.preventDefault(); activeIndex -= 1; updateSlide(); }
    else if (event.key === "Tab") {
      const focusable = [...root.querySelectorAll('button:not([disabled])')].filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  const topmeta = document.querySelector(".topmeta");
  const signOut = document.getElementById("signOutBtn");
  if (topmeta && !document.getElementById("reopenOnboardingBtn")) {
    const helpButton = document.createElement("button");
    helpButton.id = "reopenOnboardingBtn";
    helpButton.type = "button";
    helpButton.className = "onboard-help-btn";
    helpButton.textContent = "Panduan";
    helpButton.setAttribute("aria-haspopup", "dialog");
    helpButton.addEventListener("click", () => openOnboarding());
    topmeta.insertBefore(helpButton, signOut || null);
  }

  window.addEventListener("warisku:authenticated", event => {
    const user = event.detail?.user;
    if (!user?.id) return;
    activeUser = user;
    activeSupabase = event.detail?.supabase || null;
    if (!hasCompleted(user) && root.hidden) openOnboarding();
  });

  window.addEventListener("warisku:signed-out", () => {
    activeUser = null;
    activeSupabase = null;
    if (!root.hidden) {
      root.classList.remove("wo-open");
      document.body.classList.remove("wo-body-lock");
      root.hidden = true;
    }
  });
})();
