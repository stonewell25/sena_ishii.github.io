// =============================================
//  main.js — ページ描画ロジック
//  JSONデータを読み込んでDOMに反映します
// =============================================

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// ---- プロフィール描画 ----
function renderProfile(profile) {
  // Nav name
  document.getElementById('nav-name').textContent = profile.name;

  // Hero
  document.getElementById('hero-name').textContent = profile.name;
  document.getElementById('hero-title').textContent = profile.title;
  document.getElementById('hero-affiliation').textContent = profile.affiliation;
  document.getElementById('hero-bio').textContent = profile.bio;

  // Hero links
  const linksEl = document.getElementById('hero-links');
  linksEl.innerHTML = '';

  if (profile.github) {
    linksEl.appendChild(makeLink(
      `https://github.com/${profile.github}`, 'GitHub',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>'
    ));
  }

  if (profile.google_scholar) {
    linksEl.appendChild(makeLink(
      profile.google_scholar, 'Google Scholar',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 000-14z"/></svg>'
    ));
  }

  if (profile.email) {
    linksEl.appendChild(makeLink(
      `mailto:${profile.email}`, 'Email',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/></svg>'
    ));
  }

  if (profile.cv_link) {
    linksEl.appendChild(makeLink(
      profile.cv_link, 'CV / Resume',
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
    ));
  }

  // Research interests
  const interestsEl = document.getElementById('interests');
  interestsEl.innerHTML = '';
  (profile.research_interests || []).forEach(interest => {
    const tag = document.createElement('span');
    tag.className = 'interest-tag';
    tag.textContent = interest;
    interestsEl.appendChild(tag);
  });

  // Education
  renderCVEntries('education-list', profile.education || []);

  // Experience
  renderCVEntries('experience-list', profile.experience || []);

  // Contact
  document.getElementById('contact-email').textContent = profile.email || '';
  document.getElementById('contact-email').href = `mailto:${profile.email}`;

  const githubContactEl = document.getElementById('contact-github');
  if (profile.github) {
    githubContactEl.textContent = `github.com/${profile.github}`;
    githubContactEl.href = `https://github.com/${profile.github}`;
  }
}

function makeLink(href, label, iconSVG) {
  const a = document.createElement('a');
  a.className = 'hero-link';
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.innerHTML = `${iconSVG} ${label}`;
  return a;
}

function renderCVEntries(containerId, entries) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'cv-entry';
    const period = entry.period || entry.date || '';
    const title = entry.degree || entry.role || entry.title || '';
    const org = entry.institution || entry.organization || '';
    const note = entry.note || '';
    div.innerHTML = `
      <div class="cv-period">${period}</div>
      <div class="cv-detail">
        <strong>${title}</strong>
        <span>${org}${note ? ' — ' + note : ''}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ---- Publications 描画 ----
function renderPublications(pubs) {
  const list = document.getElementById('pub-list');
  list.innerHTML = '';

  // 年降順でソート
  const sorted = [...pubs].sort((a, b) => b.year - a.year);

  sorted.forEach(pub => {
    const item = document.createElement('div');
    item.className = 'pub-item';

    const typeLabel = { conference: 'Conference', journal: 'Journal', workshop: 'Workshop', preprint: 'Preprint' };
    const typeClass = pub.type || 'conference';

    const links = [];
    if (pub.link) links.push(`<a class="pub-btn" href="${pub.link}" target="_blank" rel="noopener">Link</a>`);
    if (pub.pdf)  links.push(`<a class="pub-btn" href="${pub.pdf}"  target="_blank" rel="noopener">PDF</a>`);
    if (pub.code) links.push(`<a class="pub-btn" href="${pub.code}" target="_blank" rel="noopener">Code</a>`);

    item.innerHTML = `
      <div class="pub-meta">
        <span class="pub-year">${pub.year}</span>
        <span class="pub-type ${typeClass}">${typeLabel[typeClass] || typeClass}</span>
        ${pub.note ? `<span class="pub-note">${pub.note}</span>` : ''}
      </div>
      <div class="pub-title">${pub.title}</div>
      <div class="pub-authors">${pub.authors}</div>
      <div class="pub-venue">${pub.venue}</div>
      ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
    `;
    list.appendChild(item);
  });
}

// ---- Achievements 描画 ----
function renderAchievements(achievements) {
  const list = document.getElementById('ach-list');
  list.innerHTML = '';

  const sorted = [...achievements].sort((a, b) => b.year - a.year);

  sorted.forEach(ach => {
    const item = document.createElement('div');
    item.className = 'ach-item';

    const title = ach.link
      ? `<a href="${ach.link}" target="_blank" rel="noopener">${ach.title}</a>`
      : ach.title;

    item.innerHTML = `
      <div class="ach-year">${ach.year}</div>
      <div>
        <div class="ach-title">${title}</div>
        <div class="ach-org">${ach.organization || ''}</div>
        ${ach.description ? `<div class="ach-desc">${ach.description}</div>` : ''}
      </div>
    `;
    list.appendChild(item);
  });
}

// ---- 初期化 ----
async function init() {
  try {
    const [profile, publications, achievements] = await Promise.all([
      loadJSON('data/profile.json'),
      loadJSON('data/publications.json'),
      loadJSON('data/achievements.json'),
    ]);
    renderProfile(profile);
    renderPublications(publications);
    renderAchievements(achievements);
  } catch (err) {
    console.error('データの読み込みに失敗しました:', err);
  }
}

document.addEventListener('DOMContentLoaded', init);
