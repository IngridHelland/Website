(function () {
  const root = document.getElementById('artwork-root');

  function getIdFromUrl() {
    const params = new URLSearchParams(location.search);
    return params.get('id') || '';
  }

  async function loadData() {
    // Cache-busting during development
    const url = `works.json?v=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load artworks.json (HTTP ${res.status})`);
    return res.json();
  }

  function renderNotFound(id) {
    root.innerHTML = `
      <section class="artwork-not-found">
        <h1>Artwork not found</h1>
        <p>We couldn't find artwork with id: <code>${id}</code>.</p>
        <p><a href="index.html">Back to portfolio</a></p>
      </section>
    `;
  }

  function renderArtwork(artwork) {
    const { title, year, medium, dimensions, hero, gallery = [], description } = artwork;

    const galleryHtml = gallery.length
      ? `
        <section class="artwork-gallery" aria-label="Additional images">
          ${gallery.map(src => `
            <figure class="artwork-thumb">
              <img src="${src}" alt="${title} — additional view" />
            </figure>
          `).join('')}
        </section>
      `
      : '';

    root.innerHTML = `
      <article class="artwork-details">
        <header class="artwork-header">
          <h1 class="artwork-title">${title || 'Untitled'}</h1>
          <div class="artwork-meta">
            ${year ? `<span>${year}</span>` : ''}
            ${medium ? `<span>• ${medium}</span>` : ''}
            ${dimensions ? `<span>• ${dimensions}</span>` : ''}
          </div>
        </header>

        <section class="artwork-hero" aria-label="Primary image">
          <img src="${hero}" alt="${title} — primary image" />
        </section>

        ${galleryHtml}

        <section class="artwork-description">
          <p>${description || ''}</p>
        </section>

        <nav class="artwork-actions">
          <a href="index.html" class="back-link">← Back to portfolio</a>
        </nav>
      </article>
    `;
  }

  async function init() {
    const id = getIdFromUrl();
    if (!id) {
      renderNotFound('(missing id)');
      return;
    }

    try {
      const data = await loadData();
      const artworks = Array.isArray(data.artworks) ? data.artworks : [];
      const artwork = artworks.find(a => a.id === id);

      if (!artwork) {
        renderNotFound(id);
        return;
      }

      renderArtwork(artwork);
    } catch (err) {
      console.error(err);
      root.innerHTML = `
        <section class="artwork-error">
          <h1>Error loading artwork</h1>
          <p>Please try again later.</p>
          <p><a href="index.html">Back to portfolio</a></p>
        </section>
      `;
    }
  }

  init();
})();
