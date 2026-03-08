/* ============================================================
   SiteSketch – Database Module v2.0
   IndexedDB persistence for projects, photos, annotations
   ============================================================ */

const SiteSketchDB = (() => {
  'use strict';

  const DB_NAME = 'sitesketch-db';
  const DB_VERSION = 2;
  let db = null;

  // ──── Open Database ────
  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const _db = e.target.result;
        if (!_db.objectStoreNames.contains('projects')) {
          const store = _db.createObjectStore('projects', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!_db.objectStoreNames.contains('photos')) {
          const store = _db.createObjectStore('photos', { keyPath: 'id' });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!_db.objectStoreNames.contains('annotations')) {
          const store = _db.createObjectStore('annotations', { keyPath: 'id' });
          store.createIndex('photoId', 'photoId', { unique: false });
        }
      };

      req.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };

      req.onerror = (e) => reject(e.target.error);
    });
  }

  // ──── Helpers ────
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  function tx(storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  function promisify(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ──── Projects ────
  function createProject({ name, address }) {
    const project = {
      id: generateId(),
      name,
      address: address || '',
      thumbnail: null,
      photoCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return promisify(tx('projects', 'readwrite').put(project)).then(() => project);
  }

  function getProjects() {
    // Sync fallback – returns from localStorage cache for instant render
    try {
      const cached = localStorage.getItem('ss-projects-cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  async function getProjectsAsync() {
    const store = tx('projects');
    const all = await promisify(store.getAll());
    all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    localStorage.setItem('ss-projects-cache', JSON.stringify(all));
    return all;
  }

  async function getProject(id) {
    return promisify(tx('projects').get(id));
  }

  async function updateProject(id, updates) {
    const project = await getProject(id);
    if (!project) return null;
    Object.assign(project, updates, { updatedAt: Date.now() });
    await promisify(tx('projects', 'readwrite').put(project));
    return project;
  }

  async function deleteProject(id) {
    await promisify(tx('projects', 'readwrite').delete(id));
    // Also delete related photos & annotations
    const photos = await getPhotosByProject(id);
    const photoTx = db.transaction(['photos', 'annotations'], 'readwrite');
    for (const photo of photos) {
      photoTx.objectStore('photos').delete(photo.id);
      const annots = await promisify(
        photoTx.objectStore('annotations').index('photoId').getAll(photo.id)
      );
      annots.forEach(a => photoTx.objectStore('annotations').delete(a.id));
    }
  }

  // ──── Photos ────
  async function addPhoto(projectId, dataUrl) {
    const photo = {
      id: generateId(),
      projectId,
      dataUrl,
      notes: '',
      createdAt: Date.now()
    };
    await promisify(tx('photos', 'readwrite').put(photo));
    return photo;
  }

  async function getPhotosByProject(projectId) {
    return promisify(tx('photos').index('projectId').getAll(projectId));
  }

  // ──── Import / Export ────
  async function exportData() {
    const projects = await promisify(tx('projects').getAll());
    const photos = await promisify(tx('photos').getAll());
    const annotations = await promisify(tx('annotations').getAll());
    return { version: 2, exportedAt: new Date().toISOString(), projects, photos, annotations };
  }

  async function importData(data) {
    if (!data || !data.projects) throw new Error('Invalid data');
    const t = db.transaction(['projects', 'photos', 'annotations'], 'readwrite');
    for (const p of data.projects) t.objectStore('projects').put(p);
    if (data.photos) for (const ph of data.photos) t.objectStore('photos').put(ph);
    if (data.annotations) for (const a of data.annotations) t.objectStore('annotations').put(a);
    return new Promise((resolve, reject) => {
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error);
    });
  }

  // ──── Init ────
  open().then(() => {
    console.log('SiteSketchDB ready');
    // Refresh cache
    getProjectsAsync().then(() => {
      if (typeof SiteSketch !== 'undefined') SiteSketch.loadProjects();
    });
  }).catch(err => console.error('DB Error:', err));

  return {
    createProject,
    getProjects,
    getProjectsAsync,
    getProject,
    updateProject,
    deleteProject,
    addPhoto,
    getPhotosByProject,
    exportData,
    importData
  };
})();
