import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
 
// Map your Base44 entity names to the Postgres table names from the schema.
const ENTITY_TABLE = {
  VocabularyPhrase: 'vocabulary_phrases',
  PracticeSession: 'practice_sessions',
  ChallengeResponse: 'challenge_responses',
};
 
function handle({ data, error }) {
  if (error) throw error;
  return data;
}
 
function makeEntity(table) {
  return {
    list: async (sort) => {
      let query = supabase.from(table).select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.slice(1) : sort;
        query = query.order(column, { ascending: !desc });
      }
      return handle(await query);
    },
    filter: async (whereObj = {}, sort) => {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(whereObj)) {
        query = query.eq(key, value);
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.slice(1) : sort;
        query = query.order(column, { ascending: !desc });
      }
      return handle(await query);
    },
    get: async (id) =>
      handle(await supabase.from(table).select('*').eq('id', id).single()),
    create: async (fields) =>
      handle(await supabase.from(table).insert(fields).select().single()),
    update: async (id, fields) =>
      handle(await supabase.from(table).update(fields).eq('id', id).select().single()),
    delete: async (id) =>
      handle(await supabase.from(table).delete().eq('id', id)),
  };
}
 
const entities = new Proxy(
  {},
  {
    get(_target, entityName) {
      const table = ENTITY_TABLE[entityName];
      if (!table) {
        throw new Error(
          `No table mapped for entity "${String(entityName)}". Add it to ENTITY_TABLE in client.js.`
        );
      }
      return makeEntity(table);
    },
  }
);
 
// Auth shim shaped to match exactly what Register.jsx, Onboarding.jsx,
// AuthContext.jsx etc. already call — so those files don't need edits.
const auth = {
  // Returns the logged-in user's profile row, or throws a 401 if signed out.
  me: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return { ...profile, email: user.email };
  },
 
  login: async (emailOrObj, password) => {
    const email = typeof emailOrObj === 'object' ? emailOrObj.email : emailOrObj;
    const pass = typeof emailOrObj === 'object' ? emailOrObj.password : password;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data;
  },

  loginViaEmailPassword: async (emailOrObj, password) => auth.login(emailOrObj, password),
  signInWithPassword: async (emailOrObj, password) => auth.login(emailOrObj, password),

  // Aliases in case your pages call it by a different name than `login`.
  loginViaEmailPassword: async (emailOrObj, password) => auth.login(emailOrObj, password),
  signInWithPassword: async (emailOrObj, password) => auth.login(emailOrObj, password),
 
  // Register.jsx calls: base44.auth.register({ email, password })
  // A database trigger (see schema) auto-creates the matching profiles row —
  // no manual insert needed here.
  register: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
 
  // Register.jsx calls: base44.auth.verifyOtp({ email, otpCode })
  // Supabase's default "Confirm signup" email includes a 6-digit {{ .Token }}
  // alongside the magic link, so this works out of the box.
  verifyOtp: async ({ email, otpCode }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });
    if (error) throw error;
    // Register.jsx checks result?.access_token
    return { ...data, access_token: data.session?.access_token };
  },
 
  resendOtp: async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },
 
  // No-op: Supabase's client already persists the session itself
  // (verifyOtp above already signs the user in). Kept so Register.jsx's
  // call to base44.auth.setToken(...) doesn't throw.
  setToken: () => {},
 
  // Register.jsx calls: base44.auth.loginWithProvider("google", "/")
  loginWithProvider: async (provider, redirectPath = '/') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) throw error;
    return data;
  },
 
  // Onboarding.jsx calls: base44.auth.updateMe({ goal, english_level, industry, accent, onboarded: true })
  updateMe: async (fields) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
 
  requestPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
 
  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
 
  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = redirectUrl;
  },
 
  redirectToLogin: (redirectUrl) => {
    const target = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    window.location.href = `/login${target}`;
  },
};
 
export const base44 = {
  entities,
  auth,
};