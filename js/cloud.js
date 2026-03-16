// Passwörter als SHA-256 Hashes — Klartext nie im Quellcode
// API-Key verschlüsselt (XOR mit Passwort-Hash) — wird erst bei Login entschlüsselt
const USERS = {
    'qfm_versatel': {
        passwordHash: '3b08132fb17bcf7b5cf076e9b01882367d061d65505e5f2222822d2a219584a4',
        encryptedKey: 'ak5ecOIo/klv',
        label: '1&1 Versatel', auftraggeber: '1&1 Versatel'
    },
    'qfm_vodafone': {
        passwordHash: '836f09ba95407abfe79013dc169da00322cdc7ea4e6c6635138d840016910a97',
        encryptedKey: '0ilE5cYTS43U',
        label: 'Vodafone', auftraggeber: 'Vodafone'
    }
};

// SHA-256 Hash-Funktion (async, nutzt Web Crypto API)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// API-Key entschlüsseln: XOR der verschlüsselten Bytes mit den ersten Bytes des Passwort-Hashs
function decryptApiKey(encryptedB64, passwordHash) {
    const encrypted = Uint8Array.from(atob(encryptedB64), c => c.charCodeAt(0));
    const hashBytes = [];
    for (let i = 0; i < encrypted.length * 2; i += 2) {
        hashBytes.push(parseInt(passwordHash.substring(i, i + 2), 16));
    }
    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ hashBytes[i];
    }
    return new TextDecoder().decode(decrypted);
}

// CLOUD SYNC (Cloudflare R2)
const CLOUD = {
    API: 'https://api.sitesketch.app',
    _key: null, // wird beim Login entschlüsselt, nie hardcoded
    enabled: true,
    user: null,
    setAuth(key) { this._key = key; },
    headers() { return { 'Authorization': `Bearer ${this._key}`, 'Content-Type': 'application/json' }; },
    _prefix() { return this.user ? this.user + '/' : ''; },
    async saveProject(project, photos) {
        if (!this.enabled || !this.user || !this._key) return;
        try {
const projectData = { ...project };
projectData._photos = photos.map(ph => ({ id: ph.id, projectId: ph.projectId, name: ph.name, annotations: ph.annotations, notes: ph.notes, isMapSnapshot: ph.isMapSnapshot, mapMetadata: ph.mapMetadata, createdAt: ph.createdAt, sortOrder: ph.sortOrder, sizeMultiplier: ph.sizeMultiplier, hasPhoto: !!ph.dataUrl }));
await fetch(`${this.API}/projects/${this._prefix()}${project.id}`, { method: 'PUT', headers: this.headers(), body: JSON.stringify(projectData) });
for (const ph of photos) {
    if (ph.dataUrl) {
        try {
            const parts = ph.dataUrl.split(',');
            const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const binary = atob(parts[1]);
            const arr = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
            const blob = new Blob([arr], { type: mime });
            await fetch(`${this.API}/photos/${this._prefix()}${project.id}/${ph.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this._key}`, 'Content-Type': mime },
                body: blob
            });
        } catch(e) { console.warn('Foto-Upload Fehler:', ph.id, e); }
    }
}
        } catch(e) { console.warn('Sync Fehler:', e); }
    },
    async deleteProject(id) { if (!this.enabled || !this.user || !this._key) return; try { await fetch(`${this.API}/projects/${this._prefix()}${id}`, { method: 'DELETE', headers: this.headers() }); } catch(e) {} },
    async loadAllProjects() { if (!this.enabled || !this.user || !this._key) return null; try { const r = await fetch(`${this.API}/projects?user=${this.user}`, { headers: this.headers() }); if (!r.ok) { return { _error: r.status + ' ' + r.statusText }; } return await r.json(); } catch(e) { return { _error: e.message }; } },
    async loadProject(id) { if (!this.enabled || !this.user || !this._key) return null; try { const r = await fetch(`${this.API}/projects/${this._prefix()}${id}`, { headers: this.headers() }); return r.ok ? await r.json() : null; } catch(e) { return null; } },
    async loadPhoto(projectId, photoId) { if (!this.enabled || !this.user || !this._key) return null; try { const r = await fetch(`${this.API}/photos/${this._prefix()}${projectId}/${photoId}`, { headers: { 'Authorization': `Bearer ${this._key}` } }); if (!r.ok) return null; const b = await r.blob(); return new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result); fr.readAsDataURL(b); }); } catch(e) { return null; } }
};
