export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ ok: false, error: "missing_messages" });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "missing_server_key" });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        messages
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ ok: false, error: "anthropic_error", detail: data });

    const text = (data.content || [])
      .filter(x => x.type === "text")
      .map(x => x.text)
      .join("\n");

    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
