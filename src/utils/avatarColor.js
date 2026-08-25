const PALETTE = [
  { bg: '#dbeafe', fg: '#1d4ed8' }, // blue
  { bg: '#ede9fe', fg: '#7c3aed' }, // purple
  { bg: '#d1fae5', fg: '#047857' }, // green
  { bg: '#fce7f3', fg: '#be185d' }, // pink
  { bg: '#fef3c7', fg: '#b45309' }, // amber
  { bg: '#e0e7ff', fg: '#4338ca' }, // indigo
  { bg: '#ccfbf1', fg: '#0f766e' }, // teal
];

// Simple deterministic hash so the same name always gets the same color,
// without needing to store a color per user anywhere.
export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
