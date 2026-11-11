/**
 * Muted accent colors for category tags with guaranteed high-contrast,
 * crisp readable text across both Dark (Obsidian) and Light themes.
 */

interface TagStyle {
  className: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  // Array & Hashing
  'array': 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  'hash table': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  'string': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',

  // Pointers & Search
  'two pointers': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'sliding window': 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  'binary search': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',

  // Data Structures
  'stack': 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  'linked list': 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
  'tree': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'trie': 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  'heap / priority queue': 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',

  // Algorithms
  'backtracking': 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/30',
  'graph': 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  'dynamic programming': 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30',
  'greedy': 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  'intervals': 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30',
  'math': 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
  'bit manipulation': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  'recursion': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  'matrix': 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
};

// Fallback palette for arbitrary custom tags
const FALLBACK_PALETTE = [
  'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
  'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
  'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
];

export function getTagClasses(tag: string): string {
  const normalized = tag.trim().toLowerCase();
  if (CATEGORY_STYLES[normalized]) {
    return CATEGORY_STYLES[normalized];
  }

  // Hash tag to pick deterministic color from fallback palette
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_PALETTE.length;
  return FALLBACK_PALETTE[index];
}
