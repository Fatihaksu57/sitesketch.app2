/* ============================================================
   SiteSketch – Tools Module v2.0
   Construction annotation tool definitions
   ============================================================ */

const SiteSketchTools = (() => {
  'use strict';

  // Tool definitions for the editor
  const tools = {
    trasse: {
      name: 'Trasse',
      type: 'line',
      color: '#FF6B00',
      strokeWidth: 4,
      dash: [],
      description: 'Kabeltrasse / Leitungsverlauf'
    },
    rohr: {
      name: 'Installationsrohr',
      type: 'line',
      color: '#0066FF',
      strokeWidth: 6,
      dash: [12, 6],
      description: 'Installationsrohr / Leerrohr'
    },
    schacht: {
      name: 'Schacht',
      type: 'rect',
      color: '#8B5CF6',
      size: 40,
      description: 'Schacht (Einstiegs-, Abzweig-, Zieh-)'
    },
    muffe: {
      name: 'Muffe',
      type: 'circle',
      color: '#10B981',
      radius: 12,
      description: 'Kabelmuffe / Verbindungsstelle'
    },
    bohrung: {
      name: 'Bohrung',
      type: 'circle',
      color: '#EF4444',
      radius: 16,
      innerRadius: 8,
      description: 'Horizontalbohrung / Durchbruch'
    },
    kabel: {
      name: 'Kabel',
      type: 'line',
      color: '#F59E0B',
      strokeWidth: 3,
      dash: [6, 4],
      description: 'Kabel / Glasfaser'
    },
    bestandstrasse: {
      name: 'Bestandstrasse',
      type: 'line',
      color: '#6B7280',
      strokeWidth: 3,
      dash: [4, 4],
      description: 'Bestehende Trasse'
    },
    brandschottung: {
      name: 'Brandschottung',
      type: 'rect',
      color: '#EF4444',
      size: 30,
      pattern: 'cross',
      description: 'Brandschutzabschottung'
    },
    lfkanal: {
      name: 'LF-Kanal',
      type: 'line',
      color: '#06B6D4',
      strokeWidth: 8,
      dash: [],
      description: 'Lüftungskanal'
    },
    apl_neu: {
      name: 'APL Neu',
      type: 'marker',
      color: '#10B981',
      icon: 'box',
      description: 'Abschlusspunkt Linientechnik (neu)'
    },
    apl_bestand: {
      name: 'APL Bestand',
      type: 'marker',
      color: '#6B7280',
      icon: 'box',
      description: 'Abschlusspunkt Linientechnik (Bestand)'
    },
    text: {
      name: 'Text',
      type: 'text',
      color: '#1A1D23',
      fontSize: 14,
      description: 'Textanmerkung'
    },
    measure: {
      name: 'Messen',
      type: 'measure',
      color: '#0066FF',
      strokeWidth: 2,
      description: 'Strecke messen'
    }
  };

  function getTool(name) {
    return tools[name] || null;
  }

  function getAllTools() {
    return { ...tools };
  }

  function getToolCategories() {
    return {
      'Leitungen': ['trasse', 'rohr', 'kabel', 'bestandstrasse', 'lfkanal'],
      'Punkte': ['schacht', 'muffe', 'bohrung', 'brandschottung', 'apl_neu', 'apl_bestand'],
      'Allgemein': ['text', 'measure']
    };
  }

  return {
    getTool,
    getAllTools,
    getToolCategories
  };
})();
