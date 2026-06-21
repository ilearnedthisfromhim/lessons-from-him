/**
 * POST /api/submit
 * Receives: { lesson, cardDataUrl, timestamp, consented }
 * Forwards to Google Apps Script webhook which writes to Google Sheets.
 *
 * Set GOOGLE_SCRIPT_URL in your Vercel environment variables.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lesson, cardDataUrl, timestamp, consented } = req.body

  if (!consented) {
    return res.status(200).json({ ok: true, message: 'No consent — not logged' })
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL

  if (!scriptUrl) {
    console.warn('GOOGLE_SCRIPT_URL not set — skipping sheet submission')
    return res.status(200).json({ ok: true, message: 'No script URL configured' })
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson,
        cardImageBase64: cardDataUrl,
        timestamp,
        consented,
      }),
    })

    const text = await response.text()
    return res.status(200).json({ ok: true, sheetResponse: text })
  } catch (err) {
    console.error('Sheet submission error:', err)
    return res.status(500).json({ error: 'Failed to submit to sheet' })
  }
}
