export const mockGames = [
  {
    id: 1,
    title: 'Elden Ring',
    status: 'installed',
    lastPlayed: '2 hours ago',
    playtime: '147h 32m',
    image: 'https://picsum.photos/seed/eldenring/600/340',
    size: '49.2 GB',
    platform: 'Steam',
  },
  {
    id: 2,
    title: 'Cyberpunk 2077',
    status: 'installed',
    lastPlayed: '1 day ago',
    playtime: '83h 15m',
    image: 'https://picsum.photos/seed/cyberpunk/600/340',
    size: '70.8 GB',
    platform: 'Steam',
  },
  {
    id: 3,
    title: 'Baldur\'s Gate 3',
    status: 'installed',
    lastPlayed: '3 days ago',
    playtime: '214h 8m',
    image: 'https://picsum.photos/seed/baldursgate/600/340',
    size: '122.5 GB',
    platform: 'Steam',
  },
  {
    id: 4,
    title: 'Hollow Knight',
    status: 'installed',
    lastPlayed: '1 week ago',
    playtime: '67h 44m',
    image: 'https://picsum.photos/seed/hollowknight/600/340',
    size: '7.8 GB',
    platform: 'Steam',
  },
  {
    id: 5,
    title: 'Starfield',
    status: 'update-available',
    lastPlayed: '5 days ago',
    playtime: '42h 10m',
    image: 'https://picsum.photos/seed/starfield/600/340',
    size: '115.3 GB',
    platform: 'Xbox',
  },
  {
    id: 6,
    title: 'Hades II',
    status: 'installed',
    lastPlayed: 'Today',
    playtime: '98h 22m',
    image: 'https://picsum.photos/seed/hadesii/600/340',
    size: '14.6 GB',
    platform: 'Steam',
  },
  {
    id: 7,
    title: 'Resident Evil 4',
    status: 'installed',
    lastPlayed: '2 weeks ago',
    playtime: '18h 5m',
    image: 'https://picsum.photos/seed/re4/600/340',
    size: '42.1 GB',
    platform: 'Epic',
  },
  {
    id: 8,
    title: 'Disco Elysium',
    status: 'missing',
    lastPlayed: '1 month ago',
    playtime: '36h 50m',
    image: 'https://picsum.photos/seed/discoelysium/600/340',
    size: '28.4 GB',
    platform: 'Steam',
  },
  {
    id: 9,
    title: 'Sekiro: Shadows Die Twice',
    status: 'installed',
    lastPlayed: '3 weeks ago',
    playtime: '51h 28m',
    image: 'https://picsum.photos/seed/sekiro/600/340',
    size: '21.7 GB',
    platform: 'Steam',
  },
];

export const mockFriends = [
  { id: 1, name: 'Kira Tanaka', avatar: 'https://picsum.photos/seed/kira/80/80', status: 'online', activity: 'Playing Elden Ring' },
  { id: 2, name: 'Milo Reyes', avatar: 'https://picsum.photos/seed/milo/80/80', status: 'online', activity: 'In Lobby' },
  { id: 3, name: 'Zara Okonkwo', avatar: 'https://picsum.photos/seed/zara/80/80', status: 'playing', activity: 'Playing Baldur\'s Gate 3' },
  { id: 4, name: 'Finn Callahan', avatar: 'https://picsum.photos/seed/finn/80/80', status: 'offline', activity: '' },
];

export const mockAchievements = [
  { game: 'Elden Ring', achievements: [
    { id: 1, title: 'Shardbearer Morgott', unlocked: true, progress: '100%', icon: 'trophy-fill' },
    { id: 2, title: 'Dragonlord Placidusax', unlocked: true, progress: '100%', icon: 'medal-fill' },
    { id: 3, title: 'Legendary Armaments', unlocked: false, progress: '7/9', icon: 'trophy' },
    { id: 4, title: 'Elden Lord', unlocked: true, progress: '100%', icon: 'award-fill' },
  ]},
  { game: 'Baldur\'s Gate 3', achievements: [
    { id: 5, title: 'Absolute Power', unlocked: true, progress: '100%', icon: 'trophy-fill' },
    { id: 6, title: 'Critical Hit', unlocked: false, progress: '4/12', icon: 'trophy' },
    { id: 7, title: 'Perfect Romance', unlocked: true, progress: '100%', icon: 'heart-fill' },
  ]},
  { game: 'Hades II', achievements: [
    { id: 8, title: 'First Descent', unlocked: true, progress: '100%', icon: 'trophy-fill' },
    { id: 9, title: 'Heat Master', unlocked: false, progress: '62%', icon: 'fire-fill' },
  ]},
];

export const mockRecommendations = [
  { id: 1, title: 'Metaphor: ReFantazio', desc: 'New Release', image: 'https://picsum.photos/seed/metaphor/400/225', rating: '9.2' },
  { id: 2, title: 'Silent Hill 2 Remake', desc: 'Editor\'s Pick', image: 'https://picsum.photos/seed/silenthill/400/225', rating: '8.8' },
  { id: 3, title: 'Frostpunk 2', desc: 'Community Hot', image: 'https://picsum.photos/seed/frostpunk/400/225', rating: '8.5' },
  { id: 4, title: 'Death Stranding 2', desc: 'Coming Soon', image: 'https://picsum.photos/seed/deatsd/400/225', rating: '' },
];

export const mockPosts = [
  { id: 1, author: 'Kira Tanaka', avatar: 'https://picsum.photos/seed/kira80/80/80', title: 'Just beat Placidusax on NG+7', content: 'The fight took me 34 attempts but that final combo was worth it.', likes: 24, time: '4h ago' },
  { id: 2, author: 'Zara Okonkwo', avatar: 'https://picsum.photos/seed/zara80/80/80', title: 'BG3 mod recommendations thread', content: 'Here are the top 5 mods that actually improve gameplay...', likes: 67, time: '12h ago' },
];
