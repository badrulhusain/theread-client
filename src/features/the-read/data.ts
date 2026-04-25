import type { Author, Tag, Post, Announcement, Notification, ScheduleItem, TrendingItem } from './types';

export const CAMPUS = { name: 'Ashworth College', motto: 'Lectio. Veritas. Lumen.', est: 1897 };

export const TAGS: Tag[] = [
  { id: 't1', name: 'Literature', hue: '#7a2e2e' },
  { id: 't2', name: 'Philosophy', hue: '#5a6b3a' },
  { id: 't3', name: 'Campus Life', hue: '#b08a55' },
  { id: 't4', name: 'Essays', hue: '#6b4a6e' },
  { id: 't5', name: 'Science', hue: '#3a5a6b' },
  { id: 't6', name: 'Politics', hue: '#9a3b3b' },
  { id: 't7', name: 'Poetry', hue: '#a8763a' },
  { id: 't8', name: 'Opinion', hue: '#4a4a2a' },
];

export const AUTHORS: Record<string, Author> = {
  u1: { id: 'u1', name: 'Helena Oduya', initials: 'HO', role: 'AUTHOR', dept: 'English Literature', year: 'Senior' },
  u2: { id: 'u2', name: 'Dr. Marcus Venn', initials: 'MV', role: 'ADMIN', dept: 'Philosophy', year: 'Faculty' },
  u3: { id: 'u3', name: 'Priya Raghavan', initials: 'PR', role: 'AUTHOR', dept: 'Political Science', year: 'Junior' },
  u4: { id: 'u4', name: 'Takeshi Arai', initials: 'TA', role: 'USER', dept: 'Physics', year: 'Sophomore' },
  u5: { id: 'u5', name: 'Amelia Brooks', initials: 'AB', role: 'AUTHOR', dept: 'Classics', year: 'Junior' },
  u6: { id: 'u6', name: 'Jordan Cole', initials: 'JC', role: 'USER', dept: 'Computer Science', year: 'Freshman' },
};

export const POSTS: Post[] = [
  {
    id: 'p1',
    slug: 'the-quiet-revolution-of-the-reading-room',
    title: 'The Quiet Revolution of the Reading Room',
    excerpt: "Why the library's third floor has become the most radical space on campus — and what its silence is actually saying to us.",
    cover: 'linear-gradient(135deg, #7a2e2e 0%, #4a1818 60%, #2a0c0c 100%)',
    coverAccent: '📖',
    author: AUTHORS.u1,
    createdAt: '2026-04-18T10:22:00Z',
    readTime: 7,
    tags: ['t1', 't4'],
    views: 1284,
    comments: 23,
    reactions: 147,
    featured: true,
    content: [
      { type: 'p', text: 'There is a particular kind of silence on the third floor of the Whitfield Library that you will not find anywhere else at Ashworth. It is not the vacant silence of an empty hall, nor the performative silence of a lecture. It is the active, textured silence of two hundred people all reading at once.' },
      { type: 'p', text: 'I have begun to suspect that this room — with its long oak tables, its green banker\'s lamps, its faint smell of old paper and new coffee — is doing something essential that the rest of the campus has quietly forgotten how to do.' },
      { type: 'h2', text: 'The economics of attention' },
      { type: 'p', text: 'Our feeds are engineered to fracture us. The reading room is engineered to gather us back. The architecture insists on it: the tables are long enough that you cannot fidget without disturbing strangers, the lamps are dim enough that you must bring your own focus, and the chairs — oh, those chairs — are just uncomfortable enough to keep you honest.' },
      { type: 'pull', text: 'To sit for three hours with one book is, in 2026, a form of political speech.' },
      { type: 'p', text: 'To sit for three hours with one book is, in 2026, a form of political speech. I do not say this lightly. Every minute spent reading deeply is a minute not spent being sold to, sorted, or scrolled past. It is a refusal — small, tender, unrepeatable — of the economy that wants you fragmented.' },
      { type: 'h2', text: 'What the room teaches' },
      { type: 'p', text: 'The room teaches patience, which is not the same as slowness. It teaches that your mind, when left alone with a single sustained argument, can go further than you expected. It teaches that other people can be present without being loud.' },
      { type: 'p', text: 'Every semester I watch freshmen discover the third floor the way sailors discover harbor. They come in frantic, laptops open, tabs multiplying. By October, most of them have learned to close the laptop. By November, some of them have learned to close the phone. By finals, a few of them — the lucky ones — have learned to close the door on the entire century they were born into, for an hour at a time, and simply read.' },
    ],
  },
  {
    id: 'p2',
    slug: 'on-losing-an-argument-well',
    title: 'On Losing an Argument Well',
    excerpt: "A philosophy professor's case for the underrated virtue of conceding — and why the seminar room depends on it.",
    cover: 'linear-gradient(135deg, #5a6b3a 0%, #3d4a26 70%, #1f2a0f 100%)',
    coverAccent: '◆',
    author: AUTHORS.u2,
    createdAt: '2026-04-15T14:00:00Z',
    readTime: 5,
    tags: ['t2', 't4'],
    views: 892,
    comments: 41,
    reactions: 203,
    featured: true,
    content: [
      { type: 'p', text: 'In twenty-three years of teaching philosophy, I have watched my students lose arguments in approximately four ways: angrily, silently, defensively, and — on a handful of occasions that I remember with unreasonable fondness — gracefully.' },
      { type: 'p', text: 'The fourth kind is what we should be training for.' },
    ],
  },
  {
    id: 'p3',
    slug: 'a-field-guide-to-midterm-weather',
    title: 'A Field Guide to Midterm Weather',
    excerpt: 'The seven climates of Ashworth in March, ranked by how many cups of coffee they cost you.',
    cover: 'linear-gradient(135deg, #c9a878 0%, #9a7a48 60%, #6a4a28 100%)',
    coverAccent: '☁',
    author: AUTHORS.u3,
    createdAt: '2026-04-12T09:15:00Z',
    readTime: 4,
    tags: ['t3', 't8'],
    views: 2103,
    comments: 67,
    reactions: 412,
    content: [],
  },
  {
    id: 'p4',
    slug: 'what-the-particle-didnt-know',
    title: "What the Particle Didn't Know",
    excerpt: 'A personal account of falling in love with quantum mechanics at 2am in the physics lounge.',
    cover: 'linear-gradient(135deg, #3a5a6b 0%, #1f3a4a 60%, #0f1f28 100%)',
    coverAccent: '∴',
    author: AUTHORS.u4,
    createdAt: '2026-04-10T23:45:00Z',
    readTime: 6,
    tags: ['t5', 't4'],
    views: 678,
    comments: 18,
    reactions: 89,
    content: [],
  },
  {
    id: 'p5',
    slug: 'the-ballad-of-the-dining-hall-piano',
    title: 'The Ballad of the Dining Hall Piano',
    excerpt: "Nobody tuned it. Everybody played it. Now it's gone — and the silence is the loudest thing in Whittaker Hall.",
    cover: 'linear-gradient(135deg, #6b4a6e 0%, #4a2e50 60%, #2a1530 100%)',
    coverAccent: '♪',
    author: AUTHORS.u5,
    createdAt: '2026-04-08T16:20:00Z',
    readTime: 5,
    tags: ['t3', 't7'],
    views: 1456,
    comments: 52,
    reactions: 287,
    content: [],
  },
  {
    id: 'p6',
    slug: 'notes-from-a-first-election',
    title: 'Notes from a First Election',
    excerpt: "What it felt like to vote for the first time in a campus I've only lived in for six months.",
    cover: 'linear-gradient(135deg, #9a3b3b 0%, #6a2020 60%, #3a0e0e 100%)',
    coverAccent: '★',
    author: AUTHORS.u6,
    createdAt: '2026-04-05T11:00:00Z',
    readTime: 3,
    tags: ['t6', 't3'],
    views: 934,
    comments: 28,
    reactions: 156,
    content: [],
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', kind: 'Editorial', title: 'Submissions open for the Spring Quarterly', body: 'The Read is accepting long-form essays (1,500–4,000 words) for the Spring 2026 print issue. Deadline May 14.', time: '2h ago', pinned: true },
  { id: 'a2', kind: 'Campus', title: 'Whitfield Library extends 24-hour access through finals', body: 'Third and fourth floors will remain open overnight from April 28 through May 12.', time: 'Yesterday' },
  { id: 'a3', kind: 'Event', title: "Dr. Venn's lecture: 'On Losing an Argument'", body: 'Thursday 6pm, Harcourt Auditorium. Open to all students. Reception follows.', time: '2 days ago' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', kind: 'comment', actor: AUTHORS.u2, text: 'replied to your comment on', target: 'The Quiet Revolution of the Reading Room', time: '12 min ago', unread: true },
  { id: 'n2', kind: 'follow', actor: AUTHORS.u5, text: 'started following you', target: null, time: '1 hour ago', unread: true },
  { id: 'n3', kind: 'reaction', actor: AUTHORS.u3, text: 'and 14 others reacted to', target: 'A Field Guide to Midterm Weather', time: '3 hours ago', unread: true },
  { id: 'n4', kind: 'mention', actor: AUTHORS.u1, text: 'mentioned you in', target: 'The Ballad of the Dining Hall Piano', time: 'Yesterday', unread: false },
  { id: 'n5', kind: 'editorial', actor: null, text: "Your draft 'Letters from the Carrel' was saved", target: null, time: 'Yesterday', unread: false },
  { id: 'n6', kind: 'comment', actor: AUTHORS.u6, text: 'commented on', target: 'Notes from a First Election', time: '2 days ago', unread: false },
];

export const SCHEDULE_TODAY: ScheduleItem[] = [
  { time: '09:00', title: 'ENGL 311 — The Long 19th Century', room: 'Harcourt 204', kind: 'class' },
  { time: '11:30', title: 'Editorial meeting — The Read', room: 'Whitfield 3F', kind: 'meeting', highlight: true },
  { time: '14:00', title: 'Office hours — Prof. Ames', room: 'Morris 112', kind: 'office' },
  { time: '18:00', title: 'Guest lecture: Dr. Marcus Venn', room: 'Harcourt Auditorium', kind: 'event' },
];

export const TRENDING: TrendingItem[] = [
  { title: 'The Quiet Revolution of the Reading Room', author: 'Helena Oduya', reads: '1.2k' },
  { title: 'On Losing an Argument Well', author: 'Dr. Marcus Venn', reads: '892' },
  { title: 'A Field Guide to Midterm Weather', author: 'Priya Raghavan', reads: '2.1k' },
  { title: 'The Ballad of the Dining Hall Piano', author: 'Amelia Brooks', reads: '1.4k' },
];

export function tagById(id: string): Tag {
  return TAGS.find(t => t.id === id) ?? TAGS[0];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export const SAMPLE_COMMENTS = [
  { author: AUTHORS.u2, text: "Helena — this captures exactly what I've failed to articulate in twenty years of teaching. The 'active, textured silence' is the heart of it.", time: '4h ago' },
  { author: AUTHORS.u3, text: 'Read this twice. The line about \'political speech\' will not leave my head.', time: '6h ago' },
  { author: AUTHORS.u5, text: 'I took up residence on the third floor last semester. Can confirm: the chairs are a feature, not a bug.', time: 'Yesterday' },
];
