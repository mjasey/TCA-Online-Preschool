function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

module.exports = async function changeRequestNotifyHandler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const scriptSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
  const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (!supabaseUrl || !publishableKey || !scriptUrl || !scriptSecret || !token) {
    return response.status(503).json({ ok: false, error: 'Notifications are not configured.' });
  }

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}` }
    });
    if (!userResponse.ok) return response.status(401).json({ ok: false, error: 'Sign in again.' });
    const user = await userResponse.json();
    const email = clean(user.email, 254).toLowerCase();

    const editorResponse = await fetch(`${supabaseUrl}/rest/v1/cms_editors?email=eq.${encodeURIComponent(email)}&select=email`, {
      headers: { apikey: publishableKey, Authorization: `Bearer ${token}` }
    });
    const editors = editorResponse.ok ? await editorResponse.json() : [];
    if (!editors.length) return response.status(403).json({ ok: false, error: 'Editor access required.' });

    const body = request.body && typeof request.body === 'object' ? request.body : {};
    const payload = {
      secret: scriptSecret,
      kind: 'website_change_request',
      requestId: clean(body.id, 80),
      editorEmail: email,
      category: clean(body.category, 100),
      page: clean(body.page, 100),
      summary: clean(body.summary, 120),
      details: clean(body.details, 3000),
      referenceUrl: clean(body.reference_url, 500),
      priority: clean(body.priority, 30)
    };
    if (!payload.summary || !payload.details) return response.status(400).json({ ok: false, error: 'Request details are required.' });

    const notifyResponse = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const result = await notifyResponse.json().catch(() => ({}));
    if (!notifyResponse.ok || !result.ok) {
      console.error('Google Apps Script notification failed', {
        status: notifyResponse.status,
        error: clean(result.error, 300) || 'Unknown Apps Script error'
      });
      return response.status(502).json({ ok: false, error: 'Notification could not be sent.' });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Website request notification failed', error instanceof Error ? error.message : String(error));
    return response.status(502).json({ ok: false, error: 'Notification could not be sent.' });
  }
};
