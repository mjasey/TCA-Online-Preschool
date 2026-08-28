import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm';

const CMS = window.TCA_CMS;
const els = Object.fromEntries([
  'setup-view', 'login-view', 'workspace', 'denied-view', 'denied-email',
  'magic-login', 'magic-email', 'password-login', 'login-email', 'login-password', 'login-status', 'denied-signout', 'signout',
  'user-initial', 'user-name', 'user-email', 'page-kicker', 'page-title', 'save-state',
  'editor-view', 'requests-view', 'editor-intro', 'content-form', 'save-draft', 'publish',
  'site-preview', 'preview-stage', 'preview-label', 'publish-dialog', 'publish-summary',
  'confirm-publish', 'publish-status', 'request-form', 'request-status', 'request-list',
  'refresh-requests', 'request-count', 'menu-toggle', 'toast-region'
].map(id => [id, document.getElementById(id)]));

const state = {
  supabase: null,
  config: null,
  session: null,
  editor: null,
  page: 'home',
  content: {},
  published: {},
  dirty: false,
  saving: false,
  previewReady: false,
  demo: false
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function merge(base, overlay) {
  if (!overlay || typeof overlay !== 'object' || Array.isArray(overlay)) return overlay ?? base;
  const result = { ...(base || {}) };
  Object.entries(overlay).forEach(([key, value]) => {
    result[key] = value && typeof value === 'object' && !Array.isArray(value) ? merge(result[key], value) : value;
  });
  return result;
}
function readPath(object, path) { return path.split('.').reduce((value, key) => value?.[key], object) ?? ''; }
function writePath(object, path, value) {
  const parts = path.split('.');
  let cursor = object;
  parts.slice(0, -1).forEach(key => { cursor[key] ||= {}; cursor = cursor[key]; });
  cursor[parts.at(-1)] = value;
}
function showOnly(id) {
  ['setup-view', 'login-view', 'workspace', 'denied-view'].forEach(key => { els[key].hidden = key !== id; });
}
function setMessage(element, message, ok = false) {
  element.textContent = message || '';
  element.style.color = ok ? 'var(--green)' : '';
}
function setBusy(button, busy, busyText) {
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.disabled = busy;
  button.textContent = busy ? busyText : button.dataset.label;
}
function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast';
  item.textContent = message;
  els['toast-region'].appendChild(item);
  setTimeout(() => item.remove(), 3800);
}
function setDirty(dirty) {
  state.dirty = dirty;
  els['save-state'].className = `save-state${dirty ? ' dirty' : ''}`;
  els['save-state'].innerHTML = `<i></i>${dirty ? 'Draft has unsaved changes' : 'All changes saved'}`;
}
function setSaving(saving) {
  state.saving = saving;
  if (saving) {
    els['save-state'].className = 'save-state saving';
    els['save-state'].innerHTML = '<i></i>Saving draft…';
  } else {
    setDirty(state.dirty);
  }
}

async function init() {
  const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const demoRequested = localHost && new URLSearchParams(location.search).get('demo') === '1';
  if (demoRequested) {
    state.demo = true;
    state.session = { user: { email: 'owner@example.com' }, access_token: 'demo' };
    state.editor = { email: 'owner@example.com', display_name: 'TCA Owner', role: 'admin' };
    openWorkspace();
    return;
  }

  try {
    const response = await fetch('/api/cms-config', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Configuration unavailable');
    state.config = await response.json();
  } catch (_) {
    showOnly('setup-view');
    return;
  }

  if (!state.config?.url || !state.config?.publishableKey) {
    showOnly('setup-view');
    return;
  }

  state.supabase = createClient(state.config.url, state.config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const { data, error } = await state.supabase.auth.getSession();
  if (error) console.warn('Could not restore editor session.', error.message);
  if (data?.session) await acceptSession(data.session);
  else showOnly('login-view');

  state.supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') showOnly('login-view');
    if (session && session.access_token !== state.session?.access_token) await acceptSession(session);
  });
}

async function acceptSession(session) {
  state.session = session;
  const email = String(session.user?.email || '').toLowerCase();
  const { data: editor, error } = await state.supabase
    .from('cms_editors')
    .select('email, display_name, role')
    .eq('email', email)
    .maybeSingle();

  if (error || !editor) {
    els['denied-email'].textContent = email;
    showOnly('denied-view');
    return;
  }
  state.editor = editor;
  await openWorkspace();
}

async function openWorkspace() {
  showOnly('workspace');
  const name = state.editor.display_name || state.editor.email.split('@')[0];
  els['user-name'].textContent = name;
  els['user-email'].textContent = state.editor.email;
  els['user-initial'].textContent = name.charAt(0).toUpperCase();
  await selectPage('home');
  if (!state.demo) loadRequests();
}

async function selectPage(slug) {
  if (state.dirty && !confirm('Leave this page without saving the draft?')) return;
  state.page = slug;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === slug));
  els['editor-view'].hidden = false;
  els['requests-view'].hidden = true;
  const definition = CMS.pages[slug];
  els['page-kicker'].textContent = 'Website editor';
  els['page-title'].textContent = definition.title;
  els['preview-label'].textContent = definition.title;
  els['editor-intro'].innerHTML = `<h2>${escapeHtml(definition.title)}</h2><p>${escapeHtml(definition.description)}</p>`;
  state.previewReady = false;
  els['site-preview'].src = `${definition.path}?tca-preview=1`;

  if (state.demo) {
    state.published = clone(definition.defaults);
    state.content = clone(definition.defaults);
  } else {
    setSaving(true);
    const [draftResult, publishedResult] = await Promise.all([
      state.supabase.from('page_drafts').select('content').eq('slug', slug).maybeSingle(),
      state.supabase.from('published_pages').select('content').eq('slug', slug).maybeSingle()
    ]);
    if (draftResult.error) toast('The draft could not be loaded.');
    state.published = merge(definition.defaults, publishedResult.data?.content || {});
    state.content = merge(state.published, draftResult.data?.content || {});
    state.saving = false;
  }
  renderEditor();
  setDirty(false);
  postPreview();
}

function renderEditor() {
  const definition = CMS.pages[state.page];
  els['content-form'].replaceChildren(...definition.sections.map((section, sectionIndex) => {
    const details = document.createElement('details');
    details.className = 'field-section';
    details.open = section.open || sectionIndex === 0;
    const summary = document.createElement('summary');
    summary.textContent = section.title;
    const body = document.createElement('div');
    body.className = 'field-section-body';
    section.fields.forEach(field => body.appendChild(createField(field)));
    details.append(summary, body);
    return details;
  }));
}

function createField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cms-field';
  const label = document.createElement('label');
  label.htmlFor = `cms-${field.key.replaceAll('.', '-')}`;
  label.innerHTML = `${escapeHtml(field.label)}<span>${field.type === 'textarea' ? 'Long text' : field.type === 'video' || field.type === 'image' ? 'Media' : 'Text'}</span>`;
  const value = readPath(state.content, field.key);

  let input;
  if (field.type === 'textarea') {
    input = document.createElement('textarea');
  } else {
    input = document.createElement('input');
    if (field.type === 'url') input.type = 'url';
    else if (field.type === 'email') input.type = 'email';
    else input.type = 'text';
  }
  input.id = label.htmlFor;
  input.name = field.key;
  input.value = value;
  input.addEventListener('input', () => {
    writePath(state.content, field.key, input.value);
    setDirty(true);
    postPreview();
  });

  wrapper.append(label);
  if (field.type === 'image' || field.type === 'video') {
    const media = document.createElement('div');
    media.className = 'media-control';
    const upload = document.createElement('button');
    upload.type = 'button';
    upload.className = 'button secondary-button upload-button';
    upload.textContent = 'Upload file';
    upload.addEventListener('click', () => chooseAndUpload(field, input, upload));
    media.append(input, upload);
    wrapper.append(media);
  } else wrapper.append(input);
  if (field.help) {
    const help = document.createElement('small');
    help.textContent = field.help;
    wrapper.append(help);
  }
  return wrapper;
}

async function chooseAndUpload(field, input, button) {
  if (state.demo) { toast('Uploads are available after the content service is connected.'); return; }
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = field.type === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'video/mp4,video/webm';
  picker.addEventListener('change', async () => {
    const file = picker.files?.[0];
    if (!file) return;
    const max = field.type === 'image' ? 8 * 1024 * 1024 : 75 * 1024 * 1024;
    if (file.size > max) { toast(`${field.type === 'image' ? 'Images' : 'Videos'} must be smaller than ${max / 1024 / 1024} MB.`); return; }
    setBusy(button, true, 'Uploading…');
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const owner = state.editor.email.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const path = `${owner}/${Date.now()}-${safeName}`;
    const { error } = await state.supabase.storage.from('cms-media').upload(path, file, { contentType: file.type, upsert: false });
    if (error) toast(error.message);
    else {
      const { data } = state.supabase.storage.from('cms-media').getPublicUrl(path);
      input.value = data.publicUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      toast('Media uploaded. Save the draft when you are ready.');
    }
    setBusy(button, false);
  }, { once: true });
  picker.click();
}

async function saveDraft({ quiet = false } = {}) {
  if (!state.dirty && !state.demo) return true;
  if (state.demo) { setDirty(false); if (!quiet) toast('Draft saved in the local demo.'); return true; }
  setSaving(true);
  setBusy(els['save-draft'], true, 'Saving…');
  const { error } = await state.supabase.from('page_drafts').upsert({
    slug: state.page,
    content: state.content,
    updated_by: state.session.user.id,
    updated_at: new Date().toISOString()
  }, { onConflict: 'slug' });
  setBusy(els['save-draft'], false);
  state.saving = false;
  if (error) {
    setDirty(true);
    toast(`Draft not saved: ${error.message}`);
    return false;
  }
  setDirty(false);
  if (!quiet) toast('Draft saved.');
  return true;
}

async function publishPage() {
  setMessage(els['publish-status'], '');
  setBusy(els['confirm-publish'], true, 'Publishing…');
  if (!(await saveDraft({ quiet: true }))) {
    setBusy(els['confirm-publish'], false);
    setMessage(els['publish-status'], 'Save the draft before publishing.');
    return;
  }
  if (state.demo) {
    setBusy(els['confirm-publish'], false);
    els['publish-dialog'].close();
    toast('Demo publish complete. No public page was changed.');
    return;
  }
  const { error } = await state.supabase.rpc('publish_cms_page', { p_slug: state.page });
  setBusy(els['confirm-publish'], false);
  if (error) { setMessage(els['publish-status'], error.message); return; }
  state.published = clone(state.content);
  els['publish-dialog'].close();
  toast(`${CMS.pages[state.page].title} published.`);
}

function postPreview() {
  if (!state.previewReady) return;
  els['site-preview'].contentWindow?.postMessage({ type: 'tca-cms-preview', slug: state.page, content: state.content }, location.origin);
}

async function openRequests() {
  if (state.dirty && !confirm('Open requests without saving the current draft?')) return;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === 'requests'));
  els['editor-view'].hidden = true;
  els['requests-view'].hidden = false;
  els['page-kicker'].textContent = 'Website planning';
  els['page-title'].textContent = 'Website change requests';
  if (!state.demo) await loadRequests();
  else renderRequests([]);
}

async function submitRequest(event) {
  event.preventDefault();
  const form = new FormData(els['request-form']);
  const request = Object.fromEntries(form.entries());
  request.created_by = state.session.user.id || null;
  request.created_by_email = state.session.user.email;
  setMessage(els['request-status'], '');
  const button = els['request-form'].querySelector('button[type="submit"]');
  setBusy(button, true, 'Sending request…');
  if (state.demo) {
    await new Promise(resolve => setTimeout(resolve, 350));
    setBusy(button, false);
    els['request-form'].reset();
    setMessage(els['request-status'], 'Request saved in the local demo.', true);
    return;
  }
  const { data, error } = await state.supabase.from('change_requests').insert(request).select('id').single();
  if (error) {
    setBusy(button, false);
    setMessage(els['request-status'], error.message);
    return;
  }
  let notificationSent = false;
  try {
    const response = await fetch('/api/change-request-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.session.access_token}` },
      body: JSON.stringify({ id: data.id, ...request })
    });
    notificationSent = response.ok;
  } catch (_) {}
  setBusy(button, false);
  els['request-form'].reset();
  if (notificationSent) {
    setMessage(els['request-status'], 'Request emailed and saved in the website queue.', true);
    toast('Website request emailed.');
  } else {
    setMessage(els['request-status'], 'Request saved, but the email could not be sent. Please try again or contact the site administrator.');
    toast('Request saved; email delivery failed.');
  }
  await loadRequests();
}

async function loadRequests() {
  const { data, error } = await state.supabase.from('change_requests').select('id, category, page, summary, details, priority, status, created_at').order('created_at', { ascending: false });
  if (error) { els['request-list'].innerHTML = '<div class="empty-state">Requests could not be loaded.</div>'; return; }
  renderRequests(data || []);
}

function renderRequests(requests) {
  const openCount = requests.filter(item => item.status !== 'completed').length;
  els['request-count'].hidden = openCount === 0;
  els['request-count'].textContent = openCount;
  if (!requests.length) {
    els['request-list'].innerHTML = '<div class="empty-state">No website requests yet.<br />New layout and feature ideas will appear here.</div>';
    return;
  }
  els['request-list'].innerHTML = requests.map(item => `
    <article class="request-card" data-priority="${escapeHtml(item.priority)}">
      <div class="request-card-header"><h3>${escapeHtml(item.summary)}</h3><span class="status-pill" data-status="${escapeHtml(item.status)}">${escapeHtml(item.status.replaceAll('_', ' '))}</span></div>
      <p>${escapeHtml(item.category)} · ${escapeHtml(item.page)}</p>
      <small>Sent ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(item.created_at))}</small>
    </article>`).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

els['magic-login'].addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  setBusy(button, true, 'Sending secure link…');
  const { error } = await state.supabase.auth.signInWithOtp({
    email: els['magic-email'].value,
    options: { emailRedirectTo: `${location.origin}/manage/`, shouldCreateUser: true }
  });
  setBusy(button, false);
  setMessage(els['login-status'], error ? error.message : 'Check your email. The secure sign-in link is ready.', !error);
});
els['password-login'].addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  setBusy(button, true, 'Signing in…');
  const { error } = await state.supabase.auth.signInWithPassword({ email: els['login-email'].value, password: els['login-password'].value });
  setBusy(button, false);
  if (error) setMessage(els['login-status'], 'That email and password did not work.');
});
[els['signout'], els['denied-signout']].forEach(button => button.addEventListener('click', async () => {
  if (!state.demo) await state.supabase.auth.signOut();
  else location.reload();
}));
document.querySelectorAll('.nav-item[data-view="page"]').forEach(button => button.addEventListener('click', () => selectPage(button.dataset.page)));
document.querySelector('.nav-item[data-view="requests"]').addEventListener('click', openRequests);
document.querySelectorAll('.device-switcher button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.device-switcher button').forEach(item => item.classList.toggle('active', item === button));
  els['preview-stage'].classList.toggle('mobile', button.dataset.device === 'mobile');
}));
els['site-preview'].addEventListener('load', () => { state.previewReady = true; setTimeout(postPreview, 120); });
els['save-draft'].addEventListener('click', () => saveDraft());
els['publish'].addEventListener('click', () => {
  els['publish-summary'].textContent = `The ${CMS.pages[state.page].title.toLowerCase()} will update for visitors as soon as you publish.`;
  els['publish-dialog'].showModal();
});
els['confirm-publish'].addEventListener('click', publishPage);
els['request-form'].addEventListener('submit', submitRequest);
els['refresh-requests'].addEventListener('click', loadRequests);
els['menu-toggle'].addEventListener('click', () => els.workspace.classList.toggle('menu-open'));
window.addEventListener('beforeunload', event => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });

init();
