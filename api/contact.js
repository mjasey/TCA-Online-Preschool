const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

module.exports = async function contactHandler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {};

  // Silently accept bot submissions that fill the hidden field.
  if (clean(body.company, 200)) {
    return response.status(200).json({ ok: true });
  }

  const inquiry = {
    name: clean(body.name, 100),
    email: clean(body.email, 254),
    phone: clean(body.phone, 40),
    message: clean(body.message, 2000),
  };

  if (!inquiry.name || !EMAIL_PATTERN.test(inquiry.email) || !inquiry.message) {
    return response.status(400).json({ ok: false, error: 'Please complete the required fields.' });
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    console.error('Contact form destination is not configured.');
    return response.status(503).json({ ok: false, error: 'Contact form is not configured.' });
  }

  try {
    const googleResponse = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, ...inquiry }),
      redirect: 'follow',
    });
    const text = await googleResponse.text();
    let result = {};
    try { result = JSON.parse(text); } catch (_) {}

    if (!googleResponse.ok || !result.ok) {
      console.error('Google Sheets submission failed.', googleResponse.status);
      return response.status(502).json({ ok: false, error: 'Could not save inquiry.' });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form request failed.');
    return response.status(502).json({ ok: false, error: 'Could not save inquiry.' });
  }
};
