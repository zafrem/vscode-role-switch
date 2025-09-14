import { IconDefinition, ROLE_CATEGORIES } from './types';

export const ICON_LIBRARY: IconDefinition[] = [
  // Work & Productivity Icons
  {
    name: 'laptop',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['computer', 'work', 'coding', 'development'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v13H2v2h20v-2h-2zM6 5h12v11H6V5z"/></svg>'
  },
  {
    name: 'code',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['programming', 'development', 'coding', 'software'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 6.83L6.83 8 2.83 12l4 4L8 14.17 5.17 12 8 9.17 8 6.83zM16 6.83L17.17 8 21.17 12l-4 4L16 14.17 18.83 12 16 9.17 16 6.83z"/></svg>'
  },
  {
    name: 'design',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['creative', 'ui', 'ux', 'graphics'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
  },
  {
    name: 'write',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['writing', 'document', 'content', 'blog'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
  },
  {
    name: 'research',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['study', 'analysis', 'investigation', 'search'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'
  },
  {
    name: 'meeting',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['conference', 'collaboration', 'discussion', 'team'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
  },
  {
    name: 'gear',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['settings', 'configuration', 'tools', 'maintenance'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm7.75 2c0-.72-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8 0-.33.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75s-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8s.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75V4.25L12 2v2.25c-.72 0-1.38.38-1.75.97l-.75 1.3c-.16.28-.47.45-.8.45s-.64-.17-.8-.45l-.75-1.3C7.38 4.63 6.72 4.25 6 4.25V2L4.25 4v1.75c0 .72.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75s.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75s.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75V19.75L6 22v-2.25c.72 0 1.38-.38 1.75-.97l.75-1.3c.16-.28.47-.45.8-.45s.64.17.8.45l.75 1.3c.37.59 1.03.97 1.75.97V22l1.75-2.25v-1.75c0-.72-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8s.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75z"/></svg>'
  },

  // Learning & Growth Icons
  {
    name: 'learning',
    category: ROLE_CATEGORIES.LEARNING,
    keywords: ['education', 'knowledge', 'growth', 'skill'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>'
  },
  {
    name: 'book',
    category: ROLE_CATEGORIES.LEARNING,
    keywords: ['reading', 'study', 'knowledge', 'learning'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>'
  },
  {
    name: 'brain',
    category: ROLE_CATEGORIES.LEARNING,
    keywords: ['thinking', 'intelligence', 'mental', 'cognitive'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 2C8.67 2 8 2.67 8 3.5S8.67 5 9.5 5 11 4.33 11 3.5 10.33 2 9.5 2zm-4 7c-.83 0-1.5.67-1.5 1.5S4.67 12 5.5 12 7 11.33 7 10.5 6.33 9 5.5 9zM14.5 2c.83 0 1.5.67 1.5 1.5S15.33 5 14.5 5 13 4.33 13 3.5 13.67 2 14.5 2zM18.5 9c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S19.33 9 18.5 9zM12 6.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 10.38 9.5 9 10.62 6.5 12 6.5z"/></svg>'
  },
  {
    name: 'experiment',
    category: ROLE_CATEGORIES.LEARNING,
    keywords: ['testing', 'trial', 'science', 'discovery'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2v7.38l-5.83 8.94c-.42.65.01 1.68.87 1.68h15.92c.86 0 1.29-1.03.87-1.68L15 9.38V2H9zm2 5V4h2v3H11z"/></svg>'
  },
  {
    name: 'lightbulb',
    category: ROLE_CATEGORIES.LEARNING,
    keywords: ['idea', 'innovation', 'creativity', 'inspiration'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>'
  },

  // Communication Icons
  {
    name: 'email',
    category: ROLE_CATEGORIES.COMMUNICATION,
    keywords: ['mail', 'message', 'correspondence', 'contact'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  },
  {
    name: 'phone',
    category: ROLE_CATEGORIES.COMMUNICATION,
    keywords: ['call', 'contact', 'telephone', 'communication'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>'
  },
  {
    name: 'chat',
    category: ROLE_CATEGORIES.COMMUNICATION,
    keywords: ['message', 'conversation', 'discussion', 'talk'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'
  },
  {
    name: 'users',
    category: ROLE_CATEGORIES.COMMUNICATION,
    keywords: ['team', 'group', 'people', 'collaboration'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.31-1.74-2.46-1.74s-2.12.72-2.46 1.74L13.5 16H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6l1.54-4.63C7.88 9.35 8.85 8.63 10 8.63s2.12.72 2.46 1.74L14 14.5h-1.5v7.5h-4.5z"/></svg>'
  },

  // Health & Fitness Icons
  {
    name: 'heart',
    category: ROLE_CATEGORIES.HEALTH,
    keywords: ['health', 'wellness', 'care', 'medical'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  },
  {
    name: 'exercise',
    category: ROLE_CATEGORIES.HEALTH,
    keywords: ['fitness', 'workout', 'training', 'gym'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>'
  },
  {
    name: 'meditation',
    category: ROLE_CATEGORIES.HEALTH,
    keywords: ['mindfulness', 'relaxation', 'mental health', 'peace'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-1.5 20v-6h-.5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-.5v6h-3z"/></svg>'
  },
  {
    name: 'coffee',
    category: ROLE_CATEGORIES.HEALTH,
    keywords: ['break', 'rest', 'energy', 'pause'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zM16 10c0 2.21-1.79 4-4 4s-4-1.79-4-4V7h8v3zM20 8.5c0 .83-.67 1.5-1.5 1.5H18V7h.5c.83 0 1.5.67 1.5 1.5zM4 19h16v2H4v-2z"/></svg>'
  },

  // Creative & Design Icons
  {
    name: 'music',
    category: ROLE_CATEGORIES.CREATIVE,
    keywords: ['audio', 'sound', 'creative', 'art'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
  },
  {
    name: 'art',
    category: ROLE_CATEGORIES.CREATIVE,
    keywords: ['creative', 'painting', 'design', 'visual'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.15-.59-1.56-.36-.43-.59-.99-.59-1.44 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>'
  },
  {
    name: 'camera',
    category: ROLE_CATEGORIES.CREATIVE,
    keywords: ['photography', 'visual', 'capture', 'creative'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>'
  },
  {
    name: 'palette',
    category: ROLE_CATEGORIES.CREATIVE,
    keywords: ['color', 'design', 'art', 'creative'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.15-.59-1.56-.36-.43-.59-.99-.59-1.44 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>'
  },
  {
    name: 'star',
    category: ROLE_CATEGORIES.CREATIVE,
    keywords: ['favorite', 'rating', 'quality', 'achievement'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
  },

  // Navigation & Actions Icons
  {
    name: 'home',
    category: ROLE_CATEGORIES.PERSONAL,
    keywords: ['house', 'personal', 'family', 'private'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
  },
  {
    name: 'settings',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['configuration', 'preferences', 'options', 'control'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm7.75 2c0-.72-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8 0-.33.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75s-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8s.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75V4.25L12 2v2.25c-.72 0-1.38.38-1.75.97l-.75 1.3c-.16.28-.47.45-.8.45s-.64-.17-.8-.45l-.75-1.3C7.38 4.63 6.72 4.25 6 4.25V2L4.25 4v1.75c0 .72.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75s.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75s.38 1.38.97 1.75l1.3.75c.28.16.45.47.45.8s-.17.64-.45.8l-1.3.75c-.59.37-.97 1.03-.97 1.75V19.75L6 22v-2.25c.72 0 1.38-.38 1.75-.97l.75-1.3c.16-.28.47-.45.8-.45s.64.17.8.45l.75 1.3c.37.59 1.03.97 1.75.97V22l1.75-2.25v-1.75c0-.72-.38-1.38-.97-1.75l-1.3-.75c-.28-.16-.45-.47-.45-.8s.17-.64.45-.8l1.3-.75c.59-.37.97-1.03.97-1.75z"/></svg>'
  },
  {
    name: 'search',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['find', 'lookup', 'discovery', 'explore'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>'
  },
  {
    name: 'plus',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['add', 'create', 'new', 'insert'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
  },
  {
    name: 'edit',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['modify', 'change', 'update', 'pencil'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
  },
  {
    name: 'delete',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['remove', 'trash', 'bin', 'clear'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'
  },
  {
    name: 'time',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['clock', 'schedule', 'timer', 'duration'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
  },
  {
    name: 'chart',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['analytics', 'graph', 'statistics', 'data'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.25l1.5-1.5V6.5L22 7V4.5L21.5 4h-2L19 4.5v1h-2v2h2v10.75z"/></svg>'
  },
  {
    name: 'calendar',
    category: ROLE_CATEGORIES.WORK,
    keywords: ['date', 'schedule', 'planning', 'time'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>'
  }
];

export class IconLibrary {
  private static icons = new Map<string, IconDefinition>();

  static {
    ICON_LIBRARY.forEach(icon => {
      this.icons.set(icon.name, icon);
    });
  }

  static getIcon(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  static getAllIcons(): IconDefinition[] {
    return ICON_LIBRARY;
  }

  static getIconsByCategory(category: string): IconDefinition[] {
    return ICON_LIBRARY.filter(icon => icon.category === category);
  }

  static searchIcons(query: string): IconDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    return ICON_LIBRARY.filter(icon =>
      icon.name.toLowerCase().includes(lowercaseQuery) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
      icon.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  static renderIcon(name: string, color: string = 'currentColor'): string {
    const icon = this.getIcon(name);
    if (!icon) {
      return this.getDefaultIcon(color);
    }

    return icon.svg.replace(/fill="currentColor"/g, `fill="${color}"`);
  }

  static getDefaultIcon(color: string = 'currentColor'): string {
    return `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/></svg>`;
  }

  static createIconElement(name: string, color: string = 'currentColor', size: number = 16): string {
    const svg = this.renderIcon(name, color);
    return svg.replace('<svg', `<svg width="${size}" height="${size}"`);
  }

  static validateIconName(name: string): boolean {
    return this.icons.has(name);
  }

  static getRandomIcon(): IconDefinition {
    const icons = this.getAllIcons();
    return icons[Math.floor(Math.random() * icons.length)];
  }

  static getIconsForRole(roleKeywords: string[] = []): IconDefinition[] {
    if (roleKeywords.length === 0) {
      return this.getAllIcons();
    }

    const matchingIcons = new Set<IconDefinition>();

    roleKeywords.forEach(keyword => {
      const results = this.searchIcons(keyword);
      results.forEach(icon => matchingIcons.add(icon));
    });

    return Array.from(matchingIcons);
  }

  static getCategorizedIcons(): { [category: string]: IconDefinition[] } {
    const categorized: { [category: string]: IconDefinition[] } = {};

    Object.values(ROLE_CATEGORIES).forEach(category => {
      categorized[category] = this.getIconsByCategory(category);
    });

    return categorized;
  }
}

export default IconLibrary;