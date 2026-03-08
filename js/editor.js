/* ============================================================
   SiteSketch – Editor Module v2.0
   Photo annotation editor with touch-optimized tools
   ============================================================ */

const SiteSketchEditor = (() => {
  'use strict';

  let currentProjectId = null;
  let currentPhotoIndex = 0;
  let activeTool = null;
  let canvas = null;
  let ctx = null;

  function open(projectId) {
    currentProjectId = projectId;
    currentPhotoIndex = 0;
    console.log('Editor opened for project:', projectId);
    initCanvas();
    loadPhoto();
  }

  function initCanvas() {
    const container = document.getElementById('editorCanvas');
    if (!container) return;

    // Clear previous
    container.innerHTML = '';

    canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;touch-action:none;';
    container.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Touch events
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    redraw();
  }

  async function loadPhoto() {
    if (!currentProjectId || typeof SiteSketchDB === 'undefined') return;
    const photos = await SiteSketchDB.getPhotosByProject(currentProjectId);
    if (photos.length > 0 && photos[currentPhotoIndex]) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1),
            canvas.height / (window.devicePixelRatio || 1));
        }
      };
      img.src = photos[currentPhotoIndex].dataUrl;
    }
  }

  function redraw() {
    if (!ctx || !canvas) return;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1a1d23';
    ctx.fillRect(0, 0, w, h);

    // Draw "empty editor" hint
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Foto auswählen oder aufnehmen', w / 2, h / 2);
  }

  function selectTool(toolName) {
    activeTool = toolName;
    // Update toolbar UI
    document.querySelectorAll('.editor-tool[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === toolName);
    });
  }

  // Pointer handlers (stubs)
  function onPointerDown(e) {
    if (!activeTool) return;
    // Begin stroke / placement
  }

  function onPointerMove(e) {
    if (!activeTool) return;
    // Continue stroke
  }

  function onPointerUp(e) {
    if (!activeTool) return;
    // End stroke / place element
  }

  // Init tool buttons
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.editor-tool[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => selectTool(btn.dataset.tool));
    });
  });

  return {
    open,
    selectTool,
    resizeCanvas
  };
})();
