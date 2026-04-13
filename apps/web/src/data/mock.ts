export interface User {
  pubkey: string;
  username: string;
  avatarUrl: string;
  convictionScore: number;
  accuracyRate: number;
  totalPredictions: number;
  totalEarnedFromFollowers: number;
  followerCount: number;
  followingCount: number;
  pnl: number;
  deviceType: "seeker" | "web";
}

export interface Broadcast {
  id: string;
  user: User;
  marketId: string;
  marketQuestion: string;
  category: string;
  side: "YES" | "NO";
  /** For multi-option markets, which option the user bet on */
  optionLabel?: string;
  entryPrice: number;
  amount: number;
  potentialPayout: number;
  currentPrice: number | null;
  followerCount: number;
  counterCount: number;
  engagementCount: number;
  commentCount: number;
  createdAt: string;
  resolvedAt: string | null;
}

/** A single option within a market (e.g., one F1 driver) */
export interface MarketOption {
  id: string;
  label: string;
  yesPrice: number;
  noPrice: number;
}

export interface Market {
  id: string;
  eventId: string;
  question: string;
  description: string;
  category: string;
  imageUrl: string | null;
  /** For binary markets: single YES/NO. For multi-option: multiple choices. */
  options: MarketOption[];
  volume: number;
  liquidity: number;
  closesAt: string;
  status: "active" | "closed" | "resolved";
  outcome: string | null;
  recentActivity: MarketActivity[];
}

export interface MarketActivity {
  id: string;
  user: Pick<User, "username" | "avatarUrl" | "convictionScore">;
  side: "YES" | "NO";
  optionLabel?: string;
  amount: number;
  createdAt: string;
}

export interface Position {
  id: string;
  marketId: string;
  marketQuestion: string;
  side: "YES" | "NO";
  optionLabel?: string;
  entryPrice: number;
  currentPrice: number;
  amount: number;
  unrealizedPnl: number;
  status: "active" | "won" | "lost";
  claimable: boolean;
}

// ── Mock Users ──

const users: User[] = [
  {
    pubkey: "7xKX...3mPq",
    username: "cryptoVed",
    avatarUrl: "",
    convictionScore: 87,
    accuracyRate: 0.8,
    totalPredictions: 42,
    totalEarnedFromFollowers: 124.5,
    followerCount: 312,
    followingCount: 48,
    pnl: 1842.3,
    deviceType: "seeker",
  },
  {
    pubkey: "9aBC...xYzW",
    username: "alphaSeeker",
    avatarUrl: "",
    convictionScore: 92,
    accuracyRate: 0.85,
    totalPredictions: 67,
    totalEarnedFromFollowers: 340.2,
    followerCount: 891,
    followingCount: 23,
    pnl: 5230.1,
    deviceType: "seeker",
  },
  {
    pubkey: "3dEF...hIjK",
    username: "sportsBettor",
    avatarUrl: "",
    convictionScore: 71,
    accuracyRate: 0.65,
    totalPredictions: 89,
    totalEarnedFromFollowers: 45.8,
    followerCount: 156,
    followingCount: 67,
    pnl: -320.5,
    deviceType: "web",
  },
  {
    pubkey: "5gHI...lMnO",
    username: "politicsNerd",
    avatarUrl: "",
    convictionScore: 78,
    accuracyRate: 0.72,
    totalPredictions: 34,
    totalEarnedFromFollowers: 89.1,
    followerCount: 234,
    followingCount: 91,
    pnl: 920.0,
    deviceType: "web",
  },
  {
    pubkey: "2jKL...pQrS",
    username: "degenWhale",
    avatarUrl: "",
    convictionScore: 95,
    accuracyRate: 0.9,
    totalPredictions: 28,
    totalEarnedFromFollowers: 780.4,
    followerCount: 2103,
    followingCount: 12,
    pnl: 12450.0,
    deviceType: "seeker",
  },
];

// ── Mock Broadcasts ──

export const mockBroadcasts: Broadcast[] = [
  {
    id: "b1",
    user: users[0]!,
    marketId: "m1",
    marketQuestion: "Will BTC be above $150k by July 2025?",
    category: "crypto",
    side: "YES",
    entryPrice: 0.35,
    amount: 50,
    potentialPayout: 142.85,
    currentPrice: 0.42,
    followerCount: 12,
    counterCount: 5,
    engagementCount: 48,
    commentCount: 12,
    createdAt: "2h",
    resolvedAt: null,
  },
  {
    id: "b2",
    user: users[1]!,
    marketId: "m2",
    marketQuestion: "Will ETH flip SOL in daily active addresses by Q3?",
    category: "crypto",
    side: "NO",
    entryPrice: 0.62,
    amount: 200,
    potentialPayout: 322.58,
    currentPrice: 0.58,
    followerCount: 34,
    counterCount: 21,
    engagementCount: 156,
    commentCount: 43,
    createdAt: "4h",
    resolvedAt: null,
  },
  {
    id: "b3",
    user: users[2]!,
    marketId: "m7",
    marketQuestion: "F1 Drivers' Champion 2025",
    category: "sports",
    side: "YES",
    optionLabel: "George Russell",
    entryPrice: 0.445,
    amount: 100,
    potentialPayout: 224.72,
    currentPrice: 0.445,
    followerCount: 22,
    counterCount: 15,
    engagementCount: 89,
    commentCount: 31,
    createdAt: "6h",
    resolvedAt: null,
  },
  {
    id: "b4",
    user: users[3]!,
    marketId: "m4",
    marketQuestion: "Will the US pass a stablecoin bill before August 2025?",
    category: "politics",
    side: "YES",
    entryPrice: 0.71,
    amount: 100,
    potentialPayout: 140.84,
    currentPrice: 0.68,
    followerCount: 19,
    counterCount: 7,
    engagementCount: 67,
    commentCount: 18,
    createdAt: "8h",
    resolvedAt: null,
  },
  {
    id: "b5",
    user: users[4]!,
    marketId: "m5",
    marketQuestion: "Will SOL hit $400 before the end of 2025?",
    category: "crypto",
    side: "YES",
    entryPrice: 0.28,
    amount: 500,
    potentialPayout: 1785.71,
    currentPrice: 0.31,
    followerCount: 89,
    counterCount: 42,
    engagementCount: 312,
    commentCount: 87,
    createdAt: "12h",
    resolvedAt: null,
  },
  {
    id: "b6",
    user: users[1]!,
    marketId: "m6",
    marketQuestion: "Will Apple announce an AI-powered search engine at WWDC 2025?",
    category: "tech",
    side: "NO",
    entryPrice: 0.82,
    amount: 75,
    potentialPayout: 91.46,
    currentPrice: 0.85,
    followerCount: 15,
    counterCount: 9,
    engagementCount: 94,
    commentCount: 22,
    createdAt: "1d",
    resolvedAt: null,
  },
];

// ── Mock Markets ──

export const mockMarkets: Market[] = [
  {
    id: "m1",
    eventId: "e1",
    question: "Will BTC be above $150k by July 2025?",
    description:
      "This market resolves YES if Bitcoin trades above $150,000 USD on any major exchange (Binance, Coinbase, Kraken) at any point before July 31, 2025 23:59 UTC.",
    category: "crypto",
    imageUrl: null,
    options: [{ id: "m1-yn", label: "Yes / No", yesPrice: 0.42, noPrice: 0.58 }],
    volume: 245000,
    liquidity: 89000,
    closesAt: "2025-07-31T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a1", user: { username: "cryptoVed", avatarUrl: "", convictionScore: 87 }, side: "YES", amount: 50, createdAt: "2h" },
      { id: "a2", user: { username: "bearish_bob", avatarUrl: "", convictionScore: 45 }, side: "NO", amount: 120, createdAt: "3h" },
      { id: "a3", user: { username: "degenWhale", avatarUrl: "", convictionScore: 95 }, side: "YES", amount: 500, createdAt: "5h" },
      { id: "a4", user: { username: "newbie_42", avatarUrl: "", convictionScore: 12 }, side: "YES", amount: 10, createdAt: "6h" },
    ],
  },
  {
    id: "m2",
    eventId: "e2",
    question: "Will ETH flip SOL in daily active addresses by Q3?",
    description:
      "Resolves YES if Ethereum mainnet daily active addresses exceed Solana mainnet daily active addresses for 7 consecutive days before September 30, 2025.",
    category: "crypto",
    imageUrl: null,
    options: [{ id: "m2-yn", label: "Yes / No", yesPrice: 0.38, noPrice: 0.62 }],
    volume: 178000,
    liquidity: 62000,
    closesAt: "2025-09-30T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a5", user: { username: "alphaSeeker", avatarUrl: "", convictionScore: 92 }, side: "NO", amount: 200, createdAt: "4h" },
      { id: "a6", user: { username: "eth_maxi", avatarUrl: "", convictionScore: 63 }, side: "YES", amount: 150, createdAt: "7h" },
    ],
  },
  {
    id: "m4",
    eventId: "e4",
    question: "Will the US pass a stablecoin bill before August 2025?",
    description: "Resolves YES if any stablecoin-related legislation is signed into law by the US President before August 1, 2025.",
    category: "politics",
    imageUrl: null,
    options: [{ id: "m4-yn", label: "Yes / No", yesPrice: 0.68, noPrice: 0.32 }],
    volume: 312000,
    liquidity: 105000,
    closesAt: "2025-08-01T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a8", user: { username: "politicsNerd", avatarUrl: "", convictionScore: 78 }, side: "YES", amount: 100, createdAt: "8h" },
    ],
  },
  {
    id: "m5",
    eventId: "e5",
    question: "Will SOL hit $400 before the end of 2025?",
    description: "Resolves YES if Solana (SOL) trades above $400 USD on any major exchange before December 31, 2025 23:59 UTC.",
    category: "crypto",
    imageUrl: null,
    options: [{ id: "m5-yn", label: "Yes / No", yesPrice: 0.31, noPrice: 0.69 }],
    volume: 520000,
    liquidity: 180000,
    closesAt: "2025-12-31T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a9", user: { username: "degenWhale", avatarUrl: "", convictionScore: 95 }, side: "YES", amount: 500, createdAt: "12h" },
      { id: "a10", user: { username: "alphaSeeker", avatarUrl: "", convictionScore: 92 }, side: "YES", amount: 300, createdAt: "1d" },
    ],
  },
  {
    id: "m6",
    eventId: "e6",
    question: "Will Apple announce an AI-powered search engine at WWDC 2025?",
    description: "Resolves YES if Apple officially announces a standalone AI-powered search engine product at WWDC 2025.",
    category: "tech",
    imageUrl: null,
    options: [{ id: "m6-yn", label: "Yes / No", yesPrice: 0.15, noPrice: 0.85 }],
    volume: 67000,
    liquidity: 28000,
    closesAt: "2025-06-13T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a11", user: { username: "alphaSeeker", avatarUrl: "", convictionScore: 92 }, side: "NO", amount: 75, createdAt: "1d" },
    ],
  },
  // ── Multi-option market (like F1 from Jupiter) ──
  {
    id: "m7",
    eventId: "e7",
    question: "F1 Drivers' Champion 2025",
    description: "Which driver will win the 2025 Formula 1 World Drivers' Championship? Market resolves to the driver who officially wins the title.",
    category: "sports",
    imageUrl: null,
    options: [
      { id: "m7-gr", label: "George Russell", yesPrice: 0.445, noPrice: 0.555 },
      { id: "m7-ka", label: "Kimi Antonelli", yesPrice: 0.381, noPrice: 0.619 },
      { id: "m7-cl", label: "Charles Leclerc", yesPrice: 0.0645, noPrice: 0.9355 },
      { id: "m7-op", label: "Oscar Piastri", yesPrice: 0.0585, noPrice: 0.9415 },
      { id: "m7-lh", label: "Lewis Hamilton", yesPrice: 0.0345, noPrice: 0.9655 },
    ],
    volume: 97513379,
    liquidity: 2400000,
    closesAt: "2025-12-07T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a12", user: { username: "sportsBettor", avatarUrl: "", convictionScore: 71 }, side: "YES", optionLabel: "George Russell", amount: 250, createdAt: "1h" },
      { id: "a13", user: { username: "degenWhale", avatarUrl: "", convictionScore: 95 }, side: "YES", optionLabel: "Kimi Antonelli", amount: 500, createdAt: "3h" },
      { id: "a14", user: { username: "alphaSeeker", avatarUrl: "", convictionScore: 92 }, side: "NO", optionLabel: "George Russell", amount: 300, createdAt: "5h" },
    ],
  },
  {
    id: "m8",
    eventId: "e8",
    question: "NBA MVP 2025",
    description: "Which player will be named the 2024-25 NBA Most Valuable Player?",
    category: "sports",
    imageUrl: null,
    options: [
      { id: "m8-sga", label: "Shai Gilgeous-Alexander", yesPrice: 0.62, noPrice: 0.38 },
      { id: "m8-nj", label: "Nikola Jokic", yesPrice: 0.21, noPrice: 0.79 },
      { id: "m8-giannis", label: "Giannis Antetokounmpo", yesPrice: 0.09, noPrice: 0.91 },
      { id: "m8-luka", label: "Luka Doncic", yesPrice: 0.05, noPrice: 0.95 },
    ],
    volume: 14200000,
    liquidity: 890000,
    closesAt: "2025-06-20T23:59:00Z",
    status: "active",
    outcome: null,
    recentActivity: [
      { id: "a15", user: { username: "sportsBettor", avatarUrl: "", convictionScore: 71 }, side: "YES", optionLabel: "Shai Gilgeous-Alexander", amount: 100, createdAt: "2h" },
    ],
  },
];

// ── Mock Positions ──

export const mockPositions: Position[] = [
  {
    id: "p1",
    marketId: "m1",
    marketQuestion: "Will BTC be above $150k by July 2025?",
    side: "YES",
    entryPrice: 0.35,
    currentPrice: 0.42,
    amount: 50,
    unrealizedPnl: 10.0,
    status: "active",
    claimable: false,
  },
  {
    id: "p2",
    marketId: "m5",
    marketQuestion: "Will SOL hit $400 before the end of 2025?",
    side: "YES",
    entryPrice: 0.28,
    currentPrice: 0.31,
    amount: 100,
    unrealizedPnl: 10.71,
    status: "active",
    claimable: false,
  },
  {
    id: "p5",
    marketId: "m7",
    marketQuestion: "F1 Drivers' Champion 2025",
    side: "YES",
    optionLabel: "George Russell",
    entryPrice: 0.40,
    currentPrice: 0.445,
    amount: 200,
    unrealizedPnl: 22.5,
    status: "active",
    claimable: false,
  },
  {
    id: "p3",
    marketId: "m3",
    marketQuestion: "Will Ethereum ETF see $1B inflows in a single week?",
    side: "YES",
    entryPrice: 0.45,
    currentPrice: 1.0,
    amount: 75,
    unrealizedPnl: 91.67,
    status: "won",
    claimable: true,
  },
  {
    id: "p4",
    marketId: "m3",
    marketQuestion: "Will Twitter/X launch payments by Q2 2025?",
    side: "YES",
    entryPrice: 0.55,
    currentPrice: 0.0,
    amount: 30,
    unrealizedPnl: -30.0,
    status: "lost",
    claimable: false,
  },
];

// ── Mock current user ──

export const mockCurrentUser: User = users[0]!;

// ── Categories ──

export const categories = [
  { id: "crypto", label: "Crypto", emoji: "₿" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "politics", label: "Politics", emoji: "🏛" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "economics", label: "Economics", emoji: "📊" },
  { id: "esports", label: "Esports", emoji: "🎮" },
];

/** Helper: is this a binary YES/NO market? */
export function isBinaryMarket(market: Market): boolean {
  return market.options.length === 1;
}
