/* ============================================================
   SiteSketch App – Main Controller v2.0
   Tab Bar · FAB · Pull-to-Refresh · Sidebar · Bottom Sheet
   ============================================================ */

const SiteSketch = (() => {
  'use strict';

  // ──── State ────
  let currentTab = 'projects';
  let fabOpen = false;
  let sheetOpen = false;
  let darkMode = false;

  // ──── DOM Cache ────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const dom = {};

  function cacheDom() {
    dom.shell = $('#appShell');
    dom.header = $('#appHeader');
    dom.headerTitle = $('#headerTitle');
    dom.tabBar = $('#tabBar');
    dom.tabItems = $$('.tab-bar-item[data-tab]');
    dom.sidebarItems = $$('.sidebar-item[data-tab]');
    dom.tabViews = $$('.tab-view[data-tab]');
    dom.fab = $('#fabBtn');
    dom.fabMenu = $('#fabMenu');
    dom.fabOverlay = $('#fabOverlay');
    dom.toast = $('#toast');
    dom.sheetOverlay = $('#sheetOverlay');
    dom.sheet = $('#bottomSheet');
    dom.sheetTitle = $('#sheetTitle');
    dom.sheetBody = $('#sheetBody');
    dom.toggleDark = $('#toggleDarkMode');
  }

  // ──── Tab Switching ────
  const tabTitles = {
    projects: 'Projekte',
    map: 'Karte',
    gallery: 'Galerie',
    settings: 'Einstellungen',
    editor: 'Editor'
  };

  function switchTab(tab) {
    if (tab === currentTab && tab !== 'editor') return;
    currentTab = tab;

    // Update views
    dom.tabViews.forEach(v => {
      v.classList.toggle('active', v.dataset.tab === tab);
    });

    // Update tab bar items (phone)
    dom.tabItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });

    // Update sidebar items (tablet)
    dom.sidebarItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });

    // Update header
    dom.headerTitle.textContent = tabTitles[tab] || 'SiteSketch';

    // Update shell data-view for editor mode
    dom.shell.dataset.view = tab;

    // Close FAB if open
    if (fabOpen) closeFAB();

    // Trigger map resize if switching to map
    if (tab === 'map' && typeof SiteSketchMap !== 'undefined') {
      setTimeout(() => SiteSketchMap.resize(), 100);
    }
  }

  // ──── FAB (Floating Action Button) ────
  function toggleFAB() {
    fabOpen ? closeFAB() : openFAB();
  }

  function openFAB() {
    fabOpen = true;
    dom.fab.classList.add('open');
    dom.fabMenu.classList.add('visible');
    dom.fabOverlay.classList.add('visible');
  }

  function closeFAB() {
    fabOpen = false;
    dom.fab.classList.remove('open');
    dom.fabMenu.classList.remove('visible');
    dom.fabOverlay.classList.remove('visible');
  }

  // ──── Pull-to-Refresh ────
  function initPullToRefresh(containerId, indicatorId, onRefresh) {
    const container = document.getElementById(containerId);
    const indicator = document.getElementById(indicatorId);
    if (!container || !indicator) return;

    let startY = 0;
    let pulling = false;
    let refreshing = false;
    const threshold = 70;

    container.addEventListener('touchstart', (e) => {
      if (container.scrollTop === 0 && !refreshing) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!pulling || refreshing) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && dy < 140) {
        const progress = Math.min(dy / threshold, 1);
        indicator.style.top = `${-50 + dy * 0.6}px`;
        indicator.classList.add('visible');
        indicator.querySelector('svg').style.transform = `rotate(${progress * 360}deg)`;
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      if (!pulling) return;
      pulling = false;

      const top = parseFloat(indicator.style.top || -50);
      if (top > threshold * 0.4) {
        // Trigger refresh
        refreshing = true;
        indicator.classList.add('refreshing');
        indicator.style.top = '12px';

        onRefresh(() => {
          refreshing = false;
          indicator.classList.remove('refreshing', 'visible');
          indicator.style.top = '-50px';
        });
      } else {
        indicator.classList.remove('visible');
        indicator.style.top = '-50px';
      }
    }, { passive: true });
  }

  // ──── Bottom Sheet ────
  function openSheet(title, contentHTML) {
    dom.sheetTitle.textContent = title;
    dom.sheetBody.innerHTML = contentHTML;
    dom.sheetOverlay.classList.add('visible');
    dom.sheet.classList.add('visible');
    sheetOpen = true;
  }

  function closeSheet() {
    dom.sheetOverlay.classList.remove('visible');
    dom.sheet.classList.remove('visible');
    sheetOpen = false;
  }

  // ──── Toast ────
  let toastTimer = null;
  function showToast(message, duration = 2500) {
    clearTimeout(toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add('visible');
    toastTimer = setTimeout(() => {
      dom.toast.classList.remove('visible');
    }, duration);
  }

  // ──── Dark Mode ────
  function toggleDarkMode() {
    darkMode = !darkMode;
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    dom.toggleDark.classList.toggle('active', darkMode);
    localStorage.setItem('ss-dark-mode', darkMode ? '1' : '0');

    // Update theme-color meta
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = darkMode ? '#111318' : '#FFFFFF';
  }

  function loadDarkMode() {
    darkMode = localStorage.getItem('ss-dark-mode') === '1';
    if (darkMode) {
      document.documentElement.dataset.theme = 'dark';
      dom.toggleDark.classList.add('active');
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.content = '#111318';
    }
  }

  // ──── Project Actions (stubs – connect to database.js) ────
  function createProject() {
    closeFAB();
    openSheet('Neues Projekt', `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <label style="font-size:14px;font-weight:600;color:var(--ss-text);">Projektname
          <input type="text" id="inputProjectName" placeholder="z.B. Berlin Weißensee T2"
            style="margin-top:6px;width:100%;padding:12px;border-radius:10px;border:1px solid var(--ss-border);
            background:var(--ss-bg);font-size:15px;color:var(--ss-text);outline:none;">
        </label>
        <label style="font-size:14px;font-weight:600;color:var(--ss-text);">Adresse
          <input type="text" id="inputProjectAddress" placeholder="Straße, PLZ Ort"
            style="margin-top:6px;width:100%;padding:12px;border-radius:10px;border:1px solid var(--ss-border);
            background:var(--ss-bg);font-size:15px;color:var(--ss-text);outline:none;">
        </label>
        <button onclick="SiteSketch.confirmCreateProject()"
          style="margin-top:8px;padding:14px;border-radius:12px;border:none;background:var(--ss-primary);
          color:#FFF;font-size:16px;font-weight:600;cursor:pointer;">
          Projekt erstellen
        </button>
      </div>
    `);
    setTimeout(() => {
      const inp = document.getElementById('inputProjectName');
      if (inp) inp.focus();
    }, 400);
  }

  function confirmCreateProject() {
    const name = document.getElementById('inputProjectName')?.value?.trim();
    const address = document.getElementById('inputProjectAddress')?.value?.trim();
    if (!name) {
      showToast('Bitte Projektnamen eingeben');
      return;
    }
    closeSheet();
    // Call database module
    if (typeof SiteSketchDB !== 'undefined') {
      SiteSketchDB.createProject({ name, address });
    }
    showToast(`Projekt "${name}" erstellt`);
    loadProjects();
  }

  // ──── Project List Rendering ────
  function loadProjects() {
    const list = document.getElementById('projectList');
    const empty = document.getElementById('emptyProjects');
    if (!list) return;

    let projects = [];
    if (typeof SiteSketchDB !== 'undefined') {
      projects = SiteSketchDB.getProjects() || [];
    }

    if (projects.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }

    if (empty) empty.style.display = 'none';

    // Remove old cards
    list.querySelectorAll('.project-card').forEach(c => c.remove());

    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.onclick = () => openProject(p.id);
      card.innerHTML = `
        <div class="project-thumb">
          ${p.thumbnail
            ? `<img src="${p.thumbnail}" alt="">`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>`
          }
        </div>
        <div class="project-info">
          <h3>${escapeHtml(p.name)}</h3>
          <div class="project-meta">${p.photoCount || 0} Fotos · ${formatDate(p.updatedAt || p.createdAt)}</div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  function openProject(id) {
    if (typeof SiteSketchEditor !== 'undefined') {
      SiteSketchEditor.open(id);
    }
    switchTab('editor');
  }

  function exitEditor() {
    switchTab('projects');
  }

  // ──── Settings Actions (stubs) ────
  function openSync() {
    if (typeof SiteSketchCloud !== 'undefined') {
      SiteSketchCloud.showSyncPanel();
    } else {
      showToast('Cloud-Sync nicht verfügbar');
    }
  }

  function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (typeof SiteSketchDB !== 'undefined') {
            SiteSketchDB.importData(data);
            loadProjects();
            showToast('Import erfolgreich');
          }
        } catch (err) {
          showToast('Fehler beim Import: Ungültige Datei');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function exportJSON() {
    if (typeof SiteSketchDB !== 'undefined') {
      const data = SiteSketchDB.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitesketch-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export gespeichert');
    }
  }

  function openManual() {
    openSheet('Anleitung', `
      <div style="font-size:14px;line-height:1.7;color:var(--ss-text-secondary);">
        <h3 style="font-size:16px;color:var(--ss-text);margin-bottom:8px;">SiteSketch Kurzanleitung</h3>
        <p><strong>1. Projekt erstellen:</strong> Tippe auf den + Button und gib einen Projektnamen ein.</p>
        <p><strong>2. Fotos aufnehmen:</strong> Öffne ein Projekt und nutze die Kamera zum Fotografieren.</p>
        <p><strong>3. Annotieren:</strong> Wähle ein Werkzeug aus der unteren Leiste (Trasse, Rohr, Schacht etc.) und zeichne auf dem Foto.</p>
        <p><strong>4. PDF Export:</strong> Im Projektmenü → PDF exportieren für den Bericht.</p>
        <p><strong>5. Datensicherung:</strong> Unter Einstellungen → JSON exportieren sichert alle Projekte.</p>
        <hr style="border:none;border-top:1px solid var(--ss-border);margin:16px 0;">
        <p style="font-size:12px;color:var(--ss-text-muted);">Ausführliche Anleitung unter Einstellungen → Änderungsprotokoll.</p>
      </div>
    `);
  }

  function showChangelog() {
    openSheet('Änderungsprotokoll', `
      <div style="font-size:14px;line-height:1.7;color:var(--ss-text-secondary);">
        <p><strong>v2.0</strong> – UI-Redesign: Bottom Tab Bar, FAB, Tablet-Sidebar, Pull-to-Refresh. Sync/JSON/Anleitung in Einstellungen.</p>
        <p><strong>v1.12</strong> – ALKIS-Overlay, Brandschottung, LF-Kanal.</p>
        <p><strong>v1.10</strong> – Google Maps Places API Autocomplete.</p>
        <p><strong>v1.8</strong> – PDF-Export Verbesserungen, QFM-Logo.</p>
      </div>
    `);
  }

  function openCompanySettings() {
    showToast('Firmen-Einstellungen öffnen...');
  }

  function openPDFSettings() {
    showToast('PDF-Einstellungen öffnen...');
  }

  function takePhoto() {
    closeFAB();
    showToast('Kamera wird geöffnet...');
  }

  function importPhotos() {
    closeFAB();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const count = e.target.files?.length || 0;
      showToast(`${count} Foto(s) importiert`);
    };
    input.click();
  }

  // ──── Helpers ────
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ──── Keyboard shortcut: Escape closes overlays ────
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (fabOpen) closeFAB();
      if (sheetOpen) closeSheet();
    }
  }

  // ──── Init ────
  function init() {
    cacheDom();
    loadDarkMode();

    // Pull-to-refresh for project list
    initPullToRefresh('ptrProjects', 'ptrIndicatorProjects', (done) => {
      loadProjects();
      setTimeout(done, 600);
    });

    // Pull-to-refresh for gallery
    initPullToRefresh('ptrGallery', 'ptrIndicatorGallery', (done) => {
      // Reload gallery...
      setTimeout(done, 600);
    });

    // Load projects
    loadProjects();

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    console.log('SiteSketch v2.0 initialized');
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ──── Public API ────
  return {
    switchTab,
    toggleFAB,
    closeFAB,
    openSheet,
    closeSheet,
    showToast,
    toggleDarkMode,
    createProject,
    confirmCreateProject,
    openProject,
    exitEditor,
    openSync,
    importJSON,
    exportJSON,
    openManual,
    showChangelog,
    openCompanySettings,
    openPDFSettings,
    takePhoto,
    importPhotos,
    loadProjects
  };
})();
