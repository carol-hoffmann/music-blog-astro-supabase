export type Post = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  artist: string;
  genre: string;
  date: string;
};

export const posts: Post[] = [
  {
    title: "Indie albums that feel like winter",
    slug: "indie-albums-that-feel-like-winter",
    excerpt: "Cold air, warm guitars. A short list of albums for January evenings.",
    content:
      "This is placeholder content. Later, this will come from Supabase.",
    artist: "Bon Iver",
    genre: "Indie",
    date: "2026-01-03",
  },
  {
    title: "Why I keep coming back to post-rock",
    slug: "why-i-keep-coming-back-to-post-rock",
    excerpt: "A short love letter to long songs and slow builds.",
    content:
      "This is placeholder content. Later, this will come from Supabase.",
    artist: "Explosions in the Sky",
    genre: "Post-rock",
    date: "2026-01-02",
  },
  {
    title: "3 records that made me love jazz",
    slug: "3-records-that-made-me-love-jazz",
    excerpt: "From modal classics to modern grooves.",
    content:
      "This is placeholder content. Later, this will come from Supabase.",
    artist: "Miles Davis",
    genre: "Jazz",
    date: "2026-01-01",
  },
  {
    title: "How I organise playlists by mood",
    slug: "how-i-organise-playlists-by-mood",
    excerpt: "A simple system that makes music discovery more fun.",
    content:
      "This is placeholder content. Later, this will come from Supabase.",
    artist: "Various",
    genre: "Pop",
    date: "2025-12-29",
  },
  {
    title: "The joy of live recordings",
    slug: "the-joy-of-live-recordings",
    excerpt: "Crowd noise, imperfections, and why it feels more human.",
    content:
      "This is placeholder content. Later, this will come from Supabase.",
    artist: "Radiohead",
    genre: "Alternative",
    date: "2025-12-20",
  },
];
