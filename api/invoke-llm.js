// api/invoke-llm.js
//
// A Vercel serverless function using Google's Gemini API, which has a
// genuine free tier (no credit card required). Runs server-side only,
// so your GEMINI_API_KEY never reaches the browser.
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { prompt, response_json_schema } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
 
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server' });
    }
 
    // NOTE: double check this model name is still current at
    // aistudio.google.com before relying on it in production.
    const model = 'gemini-2.5-flash';
 
    const generationConfig = {};
    if (response_json_schema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = response_json_schema;
    }
 
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(response_json_schema ? { generationConfig } : {}),
        }),
      }
    );
 
    const data = await geminiRes.json();
 
    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data?.error?.message || 'Gemini API error' });
    }
 
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
 
    if (response_json_schema) {
      // text is a JSON string when responseSchema is set — parse it so
      // the frontend gets a real object back, matching what
      // base44.integrations.Core.InvokeLLM used to return.
      return res.status(200).json(JSON.parse(text));
    }
 
    return res.status(200).json(text);
  } catch (err) {
    console.error('invoke-llm error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}