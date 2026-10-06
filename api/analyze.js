// Vercel serverless function: photo -> calorie estimate. Keeps your API key off the phone.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.APP_PASSCODE || req.headers['x-passcode'] !== process.env.APP_PASSCODE)
    return res.status(401).json({ error: 'Unauthorized' });
  const { image, ref } = req.body || {};
  if (!image || typeof image !== 'string' || image.length > 4000000)
    return res.status(400).json({ error: 'Bad image' });
  const prompt = `You are a nutrition estimator specialising in Ghanaian and West African food. Identify every food and drink in the photo, estimate the visible portion, and give nutrition for that portion. Reference servings to calibrate (scale for the visible portion; list components such as banku, soup and fish as separate items):\n${String(ref || '').slice(0, 6000)}\n\nReturn ONLY JSON: {"items":[{"name":"","portion":"short portion description","kcal":0,"p":0,"c":0,"f":0}]} with p/c/f in grams. If no food is visible return {"items":[]}.`;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.MODEL || 'claude-sonnet-5-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: prompt } ] }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data?.error?.message || 'Upstream error' });
    const text = (data.content || []).map(c => c.text || '').join('');
    const m = text.match(/\{[\s\S]*\}/);
    return res.status(200).json(m ? JSON.parse(m[0]) : { items: [] });
  } catch (e) {
    return res.status(500).json({ error: 'Could not analyse image' });
  }
}
