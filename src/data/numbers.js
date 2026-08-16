// Lesson content for the Numbers section, 1-20.
// Shared item shape (see src/data/sections.js):
//   { id, display, spokenWord, variants[], helpText, mouthShape }
//
// `spokenWord` is the canonical word Vosk's grammar is built from and the
// word TTS pronounces. `variants` are homophones considered during
// evaluation (see lib/evaluate.js) — kept even though Vosk's grammar is
// restricted to canonical spokenWords, since a looser/expanded grammar or a
// future engine may return these forms directly.
//
// `helpText` — TODO(school): written by the dev team as a concise placeholder.
// Please have a speech therapist review/replace these with clinically
// accurate articulation guidance.
// `mouthShape` — keyword used by the Help mouth animation: 'open' | 'round' | 'wide' | 'closed'.
export const NUMBERS = [
  {
    id: 1, display: '1', spokenWord: 'one', variants: ['won', 'wan', 'un', 'juan'],
    helpText: 'TODO(school): Lips start rounded then relax; tongue tip taps behind the top teeth for the "n" at the end. Say "wuh-n".',
    mouthShape: 'round',
  },
  {
    id: 2, display: '2', spokenWord: 'two', variants: ['to', 'too', 'tu', 'do'],
    helpText: 'TODO(school): Lips push forward and round tightly, like blowing a small kiss, for the long "oo" sound.',
    mouthShape: 'round',
  },
  {
    id: 3, display: '3', spokenWord: 'three', variants: ['tree', 'free', 'thee', 'twee'],
    helpText: 'TODO(school): Tongue tip pokes gently between the front teeth for "th", then mouth widens into a smile for "ree".',
    mouthShape: 'wide',
  },
  {
    id: 4, display: '4', spokenWord: 'four', variants: ['for', 'fore', 'foor', 'pour'],
    helpText: 'TODO(school): Top teeth touch the bottom lip for "f", then lips round for the "or" sound.',
    mouthShape: 'round',
  },
  {
    id: 5, display: '5', spokenWord: 'five', variants: ['fife', 'hive', 'fibe'],
    helpText: 'TODO(school): Top teeth touch bottom lip for "f", mouth opens wide for "eye", then lips almost close for "v".',
    mouthShape: 'open',
  },
  {
    id: 6, display: '6', spokenWord: 'six', variants: ['sicks', 'sick', 'seeks', 'sits'],
    helpText: 'TODO(school): Teeth close together with a wide smile, air hisses out for "s", ending in a short "-icks".',
    mouthShape: 'wide',
  },
  {
    id: 7, display: '7', spokenWord: 'seven', variants: ['sven', 'saven', 'sevan', 'devon'],
    helpText: 'TODO(school): Smile wide for "s", then bottom lip touches top teeth for "v", ending with a relaxed "-en".',
    mouthShape: 'wide',
  },
  {
    id: 8, display: '8', spokenWord: 'eight', variants: ['ate', 'eat', 'aid', 'hate'],
    helpText: 'TODO(school): Mouth opens wide then narrows quickly for the "ay" sound, tongue tip taps behind top teeth for "t".',
    mouthShape: 'open',
  },
  {
    id: 9, display: '9', spokenWord: 'nine', variants: ['nein', 'nain', 'line', 'mine'],
    helpText: 'TODO(school): Tongue tip touches behind the top teeth for "n", mouth opens wide for "eye".',
    mouthShape: 'open',
  },
  {
    id: 10, display: '10', spokenWord: 'ten', variants: ['tan', 'den', 'then', 'tin'],
    helpText: 'TODO(school): Tongue tip taps behind the top teeth for "t", mouth stays relaxed and slightly open for "en".',
    mouthShape: 'closed',
  },
  {
    id: 11, display: '11', spokenWord: 'eleven', variants: ['leven', 'eleben'],
    helpText: 'TODO(school): Mouth opens wide for "eh", tongue tip taps for "l", then relaxes into "-even".',
    mouthShape: 'open',
  },
  {
    id: 12, display: '12', spokenWord: 'twelve', variants: ['twelf', 'twelb'],
    helpText: 'TODO(school): Lips round briefly for "tw", tongue tip taps for "l", teeth close for the final "v".',
    mouthShape: 'round',
  },
  {
    id: 13, display: '13', spokenWord: 'thirteen', variants: ['thirdeen', 'firteen'],
    helpText: 'TODO(school): Tongue tip pokes between the teeth for "th", then mouth spreads wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 14, display: '14', spokenWord: 'fourteen', variants: ['forteen', 'fordeen'],
    helpText: 'TODO(school): Lips round for "four", then mouth spreads wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 15, display: '15', spokenWord: 'fifteen', variants: ['fifdeen', 'fivteen'],
    helpText: 'TODO(school): Top teeth touch bottom lip for "f", then mouth spreads wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 16, display: '16', spokenWord: 'sixteen', variants: ['sixdeen', 'sicteen'],
    helpText: 'TODO(school): Teeth close for "s", then mouth spreads wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 17, display: '17', spokenWord: 'seventeen', variants: ['sevendeen', 'sebenteen'],
    helpText: 'TODO(school): Smile wide for "s", bottom lip touches top teeth for "v", then wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 18, display: '18', spokenWord: 'eighteen', variants: ['aydeen', 'ateen'],
    helpText: 'TODO(school): Mouth opens then narrows for "ay", tongue taps for "t", then wide for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 19, display: '19', spokenWord: 'nineteen', variants: ['ninedeen', 'nineteen'],
    helpText: 'TODO(school): Tongue taps for "n", mouth opens wide for "eye", then wide again for "-teen".',
    mouthShape: 'wide',
  },
  {
    id: 20, display: '20', spokenWord: 'twenty', variants: ['twendy', 'twenny'],
    helpText: 'TODO(school): Lips round briefly for "tw", tongue taps twice for "-enty".',
    mouthShape: 'round',
  },
]
