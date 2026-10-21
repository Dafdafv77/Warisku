/*
 * Warisku frontend configuration template.
 * GitHub Actions overwrites this file in the deployment workspace using:
 *   SUPABASE_URL
 *   SUPABASE_PUBLISHABLE_KEY
 * Configure those at: Repository Settings > Secrets and variables > Actions.
 * The publishable/anon key is designed to be public in browser applications.
 * NEVER put a Supabase service_role key, database password, or OAuth client secret here.
 */
window.WARISKU_AUTH_CONFIG = {
  supabaseUrl: "https://zmlrxfdhqaodrakhwpww.supabase.co",
  supabasePublicKey: "sb_publishable_hju27qNDp2tcuepF99PvVA_nrQdcYlg"
};
