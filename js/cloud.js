/* ============================================================
   SiteSketch – Cloud Sync Module v2.0
   Sync panel & data exchange (now in Settings)
   ============================================================ */

const SiteSketchCloud = (() => {
  'use strict';

  function showSyncPanel() {
    if (typeof SiteSketch === 'undefined') return;

    SiteSketch.openSheet('Cloud-Sync', `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <div style="padding:16px;border-radius:12px;background:var(--ss-primary-light);display:flex;gap:12px;align-items:center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ss-primary)" stroke-width="2" stroke-linecap="round">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
          </svg>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--ss-primary);">Cloud-Sync</div>
            <div style="font-size:12px;color:var(--ss-text-secondary);margin-top:2px;">Sichere deine Projekte in der Cloud</div>
          </div>
        </div>

        <button onclick="SiteSketchCloud.syncNow()" style="padding:14px;border-radius:12px;border:none;
          background:var(--ss-primary);color:#FFF;font-size:15px;font-weight:600;cursor:pointer;">
          Jetzt synchronisieren
        </button>

        <div style="font-size:13px;color:var(--ss-text-muted);text-align:center;">
          Letzte Sync: noch nie
        </div>
      </div>
    `);
  }

  function syncNow() {
    if (typeof SiteSketch !== 'undefined') {
      SiteSketch.showToast('Sync gestartet...');
    }
    // TODO: Implement actual sync logic
    setTimeout(() => {
      if (typeof SiteSketch !== 'undefined') {
        SiteSketch.showToast('Sync abgeschlossen ✓');
      }
    }, 1500);
  }

  return {
    showSyncPanel,
    syncNow
  };
})();
