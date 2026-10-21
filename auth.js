/* Warisku frontend authentication powered by Supabase Auth.
 * This file contains no server secret. Google/Facebook client secrets belong in Supabase's dashboard only.
 */
const SUPABASE_JS_CDN = "https://esm.sh/@supabase/supabase-js@2";
const authConfig = window.WARISKU_AUTH_CONFIG || {};
const authView = document.getElementById("authView");
const appShell = document.getElementById("appShell");
const authForm = document.getElementById("authForm");
const authStatus = document.getElementById("authStatus");
const configNotice = document.getElementById("authConfigNotice");
const submitButton = document.getElementById("authSubmit");
const loading = document.getElementById("authLoading");
const loadingText = document.getElementById("authLoadingText");
const providerButtons = [...document.querySelectorAll("[data-provider]")];
const demoModeButton = document.getElementById("demoModeBtn");
const passwordField = document.getElementById("passwordField");
const confirmPasswordField = document.getElementById("confirmPasswordField");
const nameField = document.getElementById("nameField");
const passwordInput = document.getElementById("authPassword");
const confirmPasswordInput = document.getElementById("authPasswordConfirm");
const nameInput = document.getElementById("authName");
const emailInput = document.getElementById("authEmail");
const passwordHint = document.getElementById("passwordHint");
const authTabs = document.getElementById("authTabs");
const authSocialArea = document.getElementById("authSocialArea");
const authFooter = document.getElementById("authFormFooter");
const forgotPasswordButton = document.getElementById("forgotPasswordBtn");
const signOutButton = document.getElementById("signOutBtn");
const emailDisplay = document.getElementById("currentUserEmail");
const userAvatar = document.getElementById("userAvatar");
const prototypeTag = document.getElementById("prototypeTag");
const demoRoomLabel = document.getElementById("demoRoomLabel");

let supabase = null;
let mode = "signin";
let recoveryFlow = false;
let inDemoMode = false;
let isBusy = false;

function isSupabaseConfigured() {
  const url = String(authConfig.supabaseUrl || "").trim();
  const key = String(authConfig.supabasePublicKey || "").trim();
  return /^https?:\/\//i.test(url) &&
    !url.includes("YOUR_PROJECT_REF") &&
    key.length > 20 &&
    !key.includes("YOUR_SUPABASE_") &&
    !key.toLowerCase().includes("service_role");
}

function appRedirectUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function showStatus(message, type = "info") {
  authStatus.textContent = message;
  authStatus.className = `auth-status show ${type}`;
}

function clearStatus() {
  authStatus.textContent = "";
  authStatus.className = "auth-status";
}

function setBusy(busy, message = "Memproses...") {
  isBusy = busy;
  submitButton.disabled = busy || !supabase;
  providerButtons.forEach((button) => { button.disabled = busy || !supabase; });
  loading.classList.toggle("show", busy);
  loadingText.textContent = message;
}

function setMode(nextMode, preserveEmail = true) {
  mode = nextMode;
  clearStatus();
  const title = document.getElementById("authTitle");
  const subtitle = document.getElementById("authSubtitle");
  const tabs = [...document.querySelectorAll("[data-auth-mode]")];
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === nextMode));
  authTabs.hidden = !["signin", "signup"].includes(nextMode);
  authSocialArea.hidden = !["signin", "signup"].includes(nextMode);
  authFooter.hidden = !["signin", "signup"].includes(nextMode);
  nameField.hidden = nextMode !== "signup";
  confirmPasswordField.hidden = nextMode !== "update-password";
  passwordField.hidden = nextMode === "forgot";
  passwordInput.required = ["signin", "signup", "update-password"].includes(nextMode);
  confirmPasswordInput.required = nextMode === "update-password";
  nameInput.required = nextMode === "signup";
  passwordInput.autocomplete = nextMode === "signin" ? "current-password" : "new-password";
  passwordHint.hidden = nextMode !== "signup";
  forgotPasswordButton.hidden = nextMode !== "signin";

  if (!preserveEmail && nextMode !== "update-password") emailInput.value = "";
  emailInput.readOnly = nextMode === "update-password";
  emailInput.required = nextMode !== "update-password";
  passwordInput.value = "";
  confirmPasswordInput.value = "";

  if (nextMode === "signup") {
    title.textContent = "Buat akun Warisku";
    subtitle.textContent = "Mulai menata peta aset dan kesiapan keluarga Anda.";
    submitButton.textContent = "Buat akun dengan email";
  } else if (nextMode === "forgot") {
    title.textContent = "Pulihkan password";
    subtitle.textContent = "Kami akan mengirimkan tautan pemulihan ke email Anda.";
    submitButton.textContent = "Kirim tautan pemulihan";
  } else if (nextMode === "update-password") {
    title.textContent = "Buat password baru";
    subtitle.textContent = "Gunakan password baru yang unik untuk akun Warisku Anda.";
    submitButton.textContent = "Simpan password baru";
  } else {
    title.textContent = "Selamat datang kembali";
    subtitle.textContent = "Masuk untuk melanjutkan pengaturan kesiapan keluarga Anda.";
    submitButton.textContent = "Masuk dengan email";
  }
  submitButton.disabled = isBusy || !supabase;
}

function showAuthView() {
  inDemoMode = false;
  appShell.hidden = true;
  authView.hidden = false;
  signOutButton.hidden = true;
  emailDisplay.textContent = "";
  setMode("signin");
  window.dispatchEvent(new Event("warisku:signed-out"));
}

function showApp(session) {
  if (recoveryFlow) return;
  inDemoMode = false;
  authView.hidden = true;
  appShell.hidden = false;
  signOutButton.hidden = false;
  const email = session?.user?.email || "Akun terverifikasi";
  emailDisplay.textContent = email;
  emailDisplay.title = email;
  const fullName = session?.user?.user_metadata?.full_name || "";
  const initialsSource = fullName || email;
  userAvatar.textContent = initialsSource.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "W";
  userAvatar.title = fullName || email;
  prototypeTag.textContent = "PROTOTIPE • DATA DUMMY";
  demoRoomLabel.textContent = "Akun aktif";
  // Let the separate onboarding module decide whether this user needs the first-run tour.
  // Completion is tracked per account (Supabase metadata) with a browser-local fallback.
  window.dispatchEvent(new CustomEvent("warisku:authenticated", { detail: { user: session?.user || null, supabase } }));
}

function enterDemoMode() {
  if (supabase) return;
  inDemoMode = true;
  authView.hidden = true;
  appShell.hidden = false;
  signOutButton.hidden = true;
  emailDisplay.textContent = "Mode demo";
  prototypeTag.textContent = "DEMO • TANPA LOGIN";
  demoRoomLabel.textContent = "Data simulasi";
  userAvatar.textContent = "D";
}

function showConfigurationHelp() {
  configNotice.hidden = false;
  configNotice.innerHTML = "<strong>Login belum dikonfigurasi.</strong><br>Isi <code>supabaseUrl</code> dan <code>supabasePublicKey</code> di <code>auth-config.js</code> menggunakan URL proyek dan publishable/anon key dari Supabase. Lalu aktifkan Email, Google, dan Facebook pada Authentication → Providers. Ikuti panduan di <code>README.md</code>. Jangan pernah memasukkan service_role key atau OAuth client secret ke frontend.";
  demoModeButton.hidden = false;
  submitButton.disabled = true;
  providerButtons.forEach((button) => { button.disabled = true; });
}

function hideConfigurationHelp() {
  configNotice.hidden = true;
  demoModeButton.hidden = true;
  submitButton.disabled = false;
  providerButtons.forEach((button) => { button.disabled = false; });
}

function normaliseAuthError(error) {
  const message = error?.message || "Permintaan autentikasi gagal. Coba lagi.";
  if (/invalid login credentials/i.test(message)) return "Email atau password tidak cocok, atau akun ini menggunakan login sosial.";
  if (/email not confirmed/i.test(message)) return "Email belum dikonfirmasi. Buka email konfirmasi dari Supabase sebelum masuk.";
  if (/user already registered/i.test(message)) return "Email ini sudah terdaftar. Silakan masuk.";
  if (/password should be at least/i.test(message)) return "Password belum memenuhi panjang minimum yang diminta.";
  if (/redirect url/i.test(message)) return "URL callback belum diizinkan. Tambahkan alamat situs ini di Supabase → Authentication → URL Configuration.";
  return message;
}

async function handleFormSubmit(event) {
  event.preventDefault();
  clearStatus();
  if (!supabase) {
    showStatus("Autentikasi belum terhubung ke Supabase. Isi auth-config.js dan ikuti README sebelum membuat akun sungguhan.", "error");
    return;
  }
  if (isBusy) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const name = nameInput.value.trim();
  if (mode !== "update-password" && !email) return showStatus("Masukkan alamat email yang valid.", "error");
  if (["signin", "signup", "update-password"].includes(mode) && password.length < 8) return showStatus("Password harus berisi setidaknya 8 karakter.", "error");
  if (mode === "signup" && !name) return showStatus("Masukkan nama lengkap Anda.", "error");
  if (mode === "update-password" && password !== confirmPasswordInput.value) return showStatus("Konfirmasi password tidak cocok.", "error");

  try {
    setBusy(true, mode === "signup" ? "Membuat akun..." : mode === "forgot" ? "Mengirim email..." : mode === "update-password" ? "Memperbarui password..." : "Memverifikasi akun...");
    let result;
    if (mode === "signup") {
      result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: appRedirectUrl(), data: { full_name: name } }
      });
      if (result.error) throw result.error;
      if (result.data.session) {
        showStatus("Akun berhasil dibuat dan Anda sudah masuk.", "success");
      } else {
        setMode("signin");
        emailInput.value = email;
        showStatus("Permintaan pendaftaran berhasil. Periksa inbox/spam dan klik tautan konfirmasi sebelum masuk.", "success");
      }
    } else if (mode === "signin") {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (result.data.session) showApp(result.data.session);
    } else if (mode === "forgot") {
      result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: appRedirectUrl() });
      if (result.error) throw result.error;
      showStatus("Jika email tersebut terdaftar, tautan pemulihan akan dikirim. Periksa inbox dan folder spam.", "success");
    } else if (mode === "update-password") {
      result = await supabase.auth.updateUser({ password });
      if (result.error) throw result.error;
      recoveryFlow = false;
      showStatus("Password berhasil diperbarui.", "success");
      const { data } = await supabase.auth.getSession();
      if (data.session) showApp(data.session);
      else setMode("signin");
    }
  } catch (error) {
    showStatus(normaliseAuthError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function handleSocialLogin(provider) {
  clearStatus();
  if (!supabase) {
    showStatus("Autentikasi belum dikonfigurasi. Isi auth-config.js dan selesaikan pengaturan provider di Supabase.", "error");
    return;
  }
  if (isBusy) return;
  try {
    setBusy(true, `Membuka login ${provider === "google" ? "Google" : "Facebook"}...`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: appRedirectUrl() }
    });
    if (error) throw error;
    // Supabase redirects to the provider. If it doesn't, the button remains safely guarded.
  } catch (error) {
    showStatus(normaliseAuthError(error), "error");
    setBusy(false);
  }
}

async function handleSignOut() {
  if (!supabase || isBusy || inDemoMode) return;
  try {
    setBusy(true, "Keluar dari akun...");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    recoveryFlow = false;
    showAuthView();
    showStatus("Anda telah keluar dari akun.", "success");
  } catch (error) {
    showStatus(normaliseAuthError(error), "error");
  } finally {
    setBusy(false);
  }
}

function bindAuthUi() {
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.authMode));
  });
  forgotPasswordButton.addEventListener("click", () => setMode("forgot"));
  authForm.addEventListener("submit", handleFormSubmit);
  providerButtons.forEach((button) => button.addEventListener("click", () => handleSocialLogin(button.dataset.provider)));
  demoModeButton.addEventListener("click", enterDemoMode);
  signOutButton.addEventListener("click", handleSignOut);
}

async function bootAuth() {
  bindAuthUi();
  if (!isSupabaseConfigured()) {
    showAuthView();
    showConfigurationHelp();
    return;
  }

  try {
    const { createClient } = await import(SUPABASE_JS_CDN);
    supabase = createClient(authConfig.supabaseUrl.trim(), authConfig.supabasePublicKey.trim(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    hideConfigurationHelp();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryFlow = true;
        showAuthView();
        emailInput.value = session?.user?.email || "";
        setMode("update-password");
        showStatus("Tautan pemulihan terverifikasi. Buat password baru untuk menyelesaikan proses.", "info");
        return;
      }
      if (event === "SIGNED_OUT") {
        recoveryFlow = false;
        showAuthView();
        return;
      }
      if (session && !recoveryFlow) showApp(session);
    });

    // Supabase exchanges an OAuth/PKCE callback and restores persisted sessions here.
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) showApp(data.session);
    else showAuthView();

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const authError = params.get("error_description") || hash.get("error_description");
    if (authError) showStatus(`Login tidak selesai: ${authError}`, "error");
  } catch (error) {
    supabase = null;
    showAuthView();
    showStatus(`Library autentikasi tidak dapat dimuat. Pastikan internet tersedia dan CDN ${SUPABASE_JS_CDN} tidak diblokir. Detail: ${error?.message || "unknown error"}`, "error");
    submitButton.disabled = true;
    providerButtons.forEach((button) => { button.disabled = true; });
  }
}

bootAuth();
