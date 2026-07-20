// api/invoke-llm.js
//
// A Vercel serverless function — this runs on OpenAI's servers-adjacent
// backend (Vercel), NOT in the browser, so your OPENAI_API_KEY stays secret.
// Your React app calls this via fetch('/api/invoke-llm', ...) instead of
// calling OpenAI directly.
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { prompt, response_json_schema } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }
 
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not set on the server' });
    }
 
    // NOTE: double check this model name is still current at
    // platform.openai.com/docs/models before relying on it in production.
    const body = {
      model: 'gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
    };
 
    // If the caller wants structured JSON back (e.g. scores, exercises),
    // force OpenAI to return valid JSON matching the requested shape.
    if (response_json_schema) {
      const properties = response_json_schema.properties || {};
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          strict: true,
          schema: {
            type: 'object',
            properties,
            required: Object.keys(properties),
            additionalProperties: false,
          },
        },
      };
    }
 
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
 
    const data = await openaiRes.json();
 
    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({ error: data?.error?.message || 'OpenAI API error' });
    }
 
    const content = data.choices?.[0]?.message?.content ?? '';
 
    if (response_json_schema) {
      // content is a JSON string when response_format is set — parse it
      // so the frontend gets a real object back, matching what
      // base44.integrations.Core.InvokeLLM used to return.
      return res.status(200).json(JSON.parse(content));
    }
 
    return res.status(200).json(content);
  } catch (err) {
    console.error('invoke-llm error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}