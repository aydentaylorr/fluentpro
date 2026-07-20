import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
 
const ENTITY_TABLE = {
  VocabularyPhrase: 'vocabulary_phrases',
  PracticeSession: 'practice_sessions',
  ChallengeResponse: 'challenge_responses',
};
 
function handle({ data, error }) {
  if (error) throw error;
  return data;
}
 
async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}
 
function applySort(query, sort) {
  if (!sort) return query;
  const desc = sort.startsWith('-');
  const column = desc ? sort.slice(1) : sort;
  return query.order(column, { ascending: !desc });
}
 
function makeEntity(table) {
  return {
    list: async (sort, limit) => {
      let query = supabase.from(table).select('*');
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      return handle(await query);
    },
    filter: async (whereObj = {}, sort, limit) => {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(whereObj)) {
        query = query.eq(key, value);
      }
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      return handle(await query);
    },
    get: async (id) =>
      handle(await supabase.from(table).select('*').eq('id', id).single()),
    create: async (fields) => {
      const user_id = await getCurrentUserId();
      return handle(await supabase.from(table).insert({ ...fields, user_id }).select().single());
    },
    bulkCreate: async (rows) => {
      const user_id = await getCurrentUserId();
      const withUser = rows.map((r) => ({ ...r, user_id }));
      return handle(await supabase.from(table).insert(withUser).select());
    },
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
 
const auth = {
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
 
  register: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
 
  verifyOtp: async ({ email, otpCode }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });
    if (error) throw error;
    return { ...data, access_token: data.session?.access_token };
  },
 
  resendOtp: async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },
 
  setToken: () => {},
 
  loginWithProvider: async (provider, redirectPath = '/') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) throw error;
    return data;
  },
 
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
 
// Bridges base44.integrations.Core.InvokeLLM(...) calls to our own
// serverless endpoint at /api/invoke-llm, which talks to OpenAI securely.
const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      const res = await fetch('/api/invoke-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, response_json_schema }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'AI request failed');
      }
      return res.json();
    },
  },
};
 
export const base44 = {
  entities,
  auth,
  integrations,
};