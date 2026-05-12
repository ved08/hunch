# Social Prediction Market — Product Specification

## One-liner

A social prediction market app for Solana Seeker where every trade becomes a public broadcast — bet on real-world outcomes, build a verifiable track record, and earn when others follow your calls.

## Pitch

Prediction markets today are trading terminals — tables of numbers with zero social layer. We're building a mobile-first app for Solana Seeker (with a companion web version) that turns every prediction into shareable content. You open a feed of real-money predictions from other users, tap to agree or take the other side, and your position automatically becomes a broadcast others can react to. Every bet is settled on-chain via Jupiter's Prediction API (which aggregates Polymarket + Kalshi liquidity on Solana), so track records are verifiable and unfakeable. The result is a platform where accurate predictors build real reputation, contrarian takes spark visible debates, and market resolution moments become viral "I called it" cards. Think vector.fun's social trading model applied to prediction markets — where the content isn't token buys, it's opinions on the future with money behind them.

---

## Why This Works

### Proven model, untapped vertical
Vector.fun proved social trading works on Solana ($500M volume, 20k DAU, acquired by Coinbase). Nobody has applied this to prediction markets. Polymarket is a spreadsheet. Jupiter's prediction UI is functional but not social. This would be first.

### Predictions are inherently more shareable than trades
A memecoin buy is "I bought $BONK" — niche. A prediction is "I think BTC hits $150k by July" — everyone has an opinion. Predictions are conversation starters. The content loop is stronger than token trading.

### Verifiable track records create real status
Jupiter orders are on-chain. You can't fake a prediction history. "This person called 8/10 markets correctly" is powerful social proof that creates genuine followings.

### Jupiter does the hard work
No matching engine, liquidity sourcing, or settlement needed. Jupiter aggregates Polymarket + Kalshi liquidity on Solana and returns unsigned transactions. We're a UX and social layer — fast time-to-market.

### Seeker = the ideal distribution channel
Every Solana Seeker owner is crypto-native by definition — they bought a Solana phone. The dApp Store has 0% commission (vs Google Play's 30%), and the built-in Seed Vault hardware wallet means users already have secure key management out of the box. No embedded wallet hacks, no seed phrase education — the phone handles it.

---

## Why Seeker, Not Telegram

| Factor | Seeker App | Telegram Mini App |
|---|---|---|
| **Solana support** | Native — Seed Vault hardware wallet, MWA protocol | No native Solana support. Telegram wallets are TON-based. Requires clunky workarounds. |
| **Wallet UX** | Hardware-secured signing via Seed Vault, one-tap approve | Need embedded wallet (Privy/Dynamic) — added dependency, no hardware security |
| **Push notifications** | Full Android push notifications | Only bot messages (users mute them) |
| **Performance** | Native Android / React Native — smooth charts, animations | WebView — sluggish, limited rendering |
| **Distribution** | dApp Store (0% commission), every user is crypto-native | 900M users but most aren't crypto-native, 30% fee risk |
| **Platform risk** | Android is open, dApp Store is permissionless | Telegram can change Mini App policies anytime |
| **Offline / background** | Full background processing, services | No background execution in WebView |

**The dealbreaker:** Telegram Mini Apps don't natively support Solana wallets. The entire TON ecosystem is oriented around TON chain. Building a Solana prediction market inside Telegram requires bolting on an embedded wallet, which adds friction, cost, and a dependency that doesn't need to exist on Seeker.

---

## Core Product

### The Loop

```
See prediction in feed -> agree or disagree -> put money on it -> your trade becomes a broadcast -> others react -> repeat
```

### 1. Prediction Feed (Home Screen)

The primary interface. Not a market browser or trading terminal — a social feed of real-money predictions.

**Feed content:**
- Broadcast cards from users showing their live predictions with real money behind them
- Each card shows: market question, user's position (YES/NO), bet size, entry price, user's track record
- Sortable by: trending (most volume), controversial (near 50/50 split), new, closing soon

**Categories:** crypto, sports, politics, tech, culture, economics, esports (sourced from Jupiter's event categories)

**"Closing soon" filter is critical** — creates urgency and solves the slow feedback loop problem that prediction markets have vs. instant-gratification memecoin trading.

### 2. Prediction Broadcasts (Core Mechanic)

Every trade automatically generates a broadcast card. No extra action needed — trading IS content creation.

**Broadcast card anatomy:**
```
+----------------------------------------------+
|  Ved's Prediction                             |
|  "BTC above $150k by July?" -> YES            |
|                                               |
|  Entry: $0.35 | Bet: $50                      |
|  Potential payout: $142.85                    |
|                                               |
|  Track record: 8/10 correct                   |
|  Conviction score: 87                         |
|  Earned $12.40 from followers                 |
|                                               |
|  [Follow this prediction]   [Take NO]         |
|  [Share]                                      |
+----------------------------------------------+
```

**Key design decisions:**
- Broadcasts are immutable — tied to on-chain transactions, can't be faked or deleted
- Both entry AND exit are broadcast (so users can't hide losses)
- "Follow this prediction" = buy the same side at current price (attributed to broadcaster)
  

### 4. Conviction Score (Reputation System)

Not a basic leaderboard — a weighted reputation algorithm.

**Factors:**
- Accuracy rate (% of predictions that resolved correctly)
- Skin in the game (average position size — bigger bets = more conviction)
- Consistency (regular activity, not one lucky bet)
- Diversity (predictions across categories, not just one niche)

**Why this matters:**
Someone who bets $5 on everything and gets 60% right ranks lower than someone who bets $200 on 5 markets and gets 4 right. This surfaces genuinely skilled predictors, not just high-volume noise.

Conviction score is the moat — it's a portable, verifiable reputation that users build over time and don't want to abandon.

### 5. Resolution Moments (Viral Mechanic)

When a market settles:
- All participants get a push notification + result card
- Winners get a shareable "I called it" card showing their entry price, payout, and P&L
- Resolution cards are optimized for sharing to X, Telegram, WhatsApp, etc. via Android's native share sheet

This is the viral moment. People share wins (and funny losses) organically.

### 6. Push Notifications

Full Android push notifications — a major advantage over web-only or Telegram-based approaches.

**Notifications:**
- "Market X just moved 20% in 1 hour — you bought at $0.35, now $0.55. Take profit?"
- "New trending market in crypto: Will ETH hit $5k by August?"
- "Your prediction resolved! You won $42.50"
- "3 people followed your prediction today — you earned $1.20"
- Daily/weekly portfolio digest

**Actionable notifications:** Tap to go directly to the market or position. Deep linking into the app for instant action.

### 7. User Profile

- Prediction history (all broadcasts, verifiable on-chain)
- P&L chart over time
- Conviction score and rank
- Accuracy by category (e.g., 90% in crypto, 40% in sports)
- Followers / following count
- Total earned from followers
- Shareable stats card (via Android share sheet)

---

## Monetization

### The Problem

Jupiter's Prediction API does not currently support integrator fee sharing. The referral program (50-255 bps) only works with Swap and Trigger APIs, not Prediction.

### The Solution: Transaction-Level Fee Capture

Jupiter returns an **unsigned Solana transaction**. We control what happens before the user signs via Seed Vault / MWA. We inject fee transfer instructions into the transaction.

### How it works

```
User wants to bet $10 YES on "BTC hits $150k"
                    |
Backend calls Jupiter API: depositAmount = $9.70
                    |
Jupiter returns unsigned transaction (TX_A)
                    |
Backend creates fee transfer instructions:
   -> $0.20 (2%) to platform wallet
   -> $0.10 (1%) to broadcaster wallet (if attributed)
                    |
Combine fee instructions + Jupiter instructions into one transaction
                    |
User approves via Seed Vault (one tap) -> prediction placed + fees routed
```

The user sees a transparent breakdown before signing:
```
Trade amount:       $9.70
Platform fee:       $0.20 (2%)
Broadcaster reward: $0.10 (1%)
Total:              $10.00
```

### Implementation approaches

**Option A: Instruction Injection**
Deserialize Jupiter's VersionedTransaction, extract instructions, build a new transaction with fee transfer instructions prepended, re-serialize. Simpler but may break if Jupiter uses complex address lookup tables.

**Option B: Jito Bundle (more robust)**
Send two separate transactions as an atomic Jito bundle — if one fails, both fail. Transaction 1 handles fee transfers, Transaction 2 is Jupiter's unmodified prediction order. Avoids touching Jupiter's transaction, slightly higher cost (Jito tip ~0.001 SOL).

### Fee structure

| Recipient | Cut | Condition |
|---|---|---|
| Platform | 2% | Every trade |
| Broadcaster | 1% | Only on attributed trades (user followed someone's broadcast) |
| Jupiter | Variable | Built into their transaction (based on contract price, size, uncertainty) |
| User total cost | ~3-5% | Platform fees + Jupiter's existing fees |

Competitive with Polymarket's spread-based cost model.

### Broadcaster attribution flow

```
User A buys YES -> broadcast card appears in feed
                         |
User B sees it -> taps "Follow this prediction"
                         |
Backend tags order: broadcasterPubkey = User A's wallet
                         |
Fee split happens on-chain in the same transaction
                         |
User A earns 1% of User B's trade amount immediately
```

**Earnings examples:**

| Scenario | User B's bet | Broadcaster earns |
|---|---|---|
| 1 follower, small bet | $10 | $0.10 |
| 10 followers, $10 each | $100 total | $1.00 |
| 1 whale follower | $500 | $5.00 |
| Popular broadcaster, 50 followers/week | ~$2,000 volume | ~$20/week |

Broadcaster rewards are **on-chain and immediate** — not points, not "pending review." This makes the incentive credible and sticky.

### Attribution tracking (backend)

```typescript
interface TradeAttribution {
  tradeId: string;
  traderPubkey: string;        // User B (the follower)
  broadcasterPubkey: string;   // User A (the broadcaster)
  marketId: string;
  broadcastId: string;         // which broadcast card led to this trade
  amount: number;              // User B's trade amount
  broadcasterFee: number;      // 1% sent to broadcaster
  platformFee: number;         // 2% sent to platform
  txSignature: string;         // on-chain proof
  timestamp: number;
}
```

### Additional revenue streams

**Swap on-ramp fees (Day 1 revenue)**
Users need USDC/JupUSD to trade predictions. Integrate Jupiter's Ultra Swap API to let users swap SOL -> USDC inside the app. Ultra Swap DOES support integrator fees (50-255 bps via referral program). Every time someone funds their wallet through the app, we earn.

**Premium features (Month 2+)**
- Advanced analytics and prediction insights
- Unlimited follows (free tier: follow 10 predictors)
- Price alerts and watchlists
- Early access to new markets
- Custom notification rules

**Sponsored markets (Month 3+)**
Projects pay to have their token-related prediction markets featured in the feed. "Will $TOKEN hit $X by date?" — promoted by the project team.

---

## Technical Architecture

### Platform strategy

```
Primary:    Seeker Android app (React Native) — distributed via Solana dApp Store
Secondary:  Web app (React) — same UI, wallet adapter for browser wallets
Future:     Google Play Store listing (broader Android reach)
```

The Seeker app is the primary product. The web version ensures users without a Seeker device can still access the platform via any browser with a Solana wallet extension (Phantom, Backpack, etc.).

### Why React Native for Seeker

- Shared codebase between Seeker app and web version (React Native Web)
- First-class Solana Mobile Stack support (`@solana-mobile/mobile-wallet-adapter-protocol`)
- Official Solana Mobile dApp scaffold available (`@solana-mobile/solana-mobile-dapp-scaffold`)
- Near-native performance for feed scrolling, charts, animations
- Large ecosystem of libraries for push notifications, deep linking, share sheets

### Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + TypeScript |
| Web app | React (shared components via React Native Web) |
| Styling | Tailwind CSS (web) / NativeWind (React Native) |
| Wallet (Seeker) | Mobile Wallet Adapter (MWA) + Seed Vault — hardware-secured signing |
| Wallet (Web) | `@solana/wallet-adapter-react` — Phantom, Backpack, etc. |
| Backend | Node.js (Express or Hono) or serverless (Cloudflare Workers) |
| Database | PostgreSQL (user profiles, attributions, feed data) |
| Cache | Redis (feed ranking, leaderboard, rate limiting) |
| Prediction API | Jupiter Prediction API (`api.jup.ag/prediction/v1`) |
| Swap API | Jupiter Ultra Swap API (`api.jup.ag/ultra/v1`) — for on-ramp |
| Transaction bundling | Jito bundles (atomic fee + trade execution) |
| Push notifications | Firebase Cloud Messaging (FCM) |
| On-ramp | Moonpay or Transak (fiat -> USDC) |
| Distribution | Solana dApp Store (primary), web URL (secondary) |

### Wallet integration — Seeker vs Web

**Seeker (Mobile Wallet Adapter):**
```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

async function signAndSendPrediction(transaction: VersionedTransaction) {
  await transact(async (wallet) => {
    // Authorize with Seed Vault
    const auth = await wallet.authorize({
      cluster: 'mainnet-beta',
      identity: {
        name: 'YourApp',
        uri: 'https://yourapp.com',
        icon: 'icon.png',
      },
    });

    // Sign via hardware Seed Vault — user taps once to approve
    const signedTx = await wallet.signTransactions({
      transactions: [transaction],
    });

    // Send to Solana
    const connection = new Connection(RPC_URL);
    const sig = await connection.sendRawTransaction(signedTx[0].serialize());
    return sig;
  });
}
```

**Web (Wallet Adapter):**
```typescript
import { useWallet } from '@solana/wallet-adapter-react';

function usePredictionTrade() {
  const { signTransaction, sendTransaction } = useWallet();

  async function executeTrade(transaction: VersionedTransaction) {
    const signed = await signTransaction(transaction);
    const connection = new Connection(RPC_URL);
    const sig = await connection.sendRawTransaction(signed.serialize());
    return sig;
  }

  return { executeTrade };
}
```

The backend is identical for both — only the signing path differs. Abstract this behind a `WalletProvider` interface so the same trade logic works on Seeker and web.

### Jupiter Prediction API — Key endpoints used

**Market Discovery:**
| Endpoint | Method | Purpose |
|---|---|---|
| `/events` | GET | Browse/filter prediction events by category, status |
| `/events/search` | GET | Search events by keyword |
| `/events/{eventId}` | GET | Event details with associated markets |
| `/events/suggested/{pubkey}` | GET | Personalized recommendations |
| `/markets/{marketId}` | GET | Market details + current pricing |
| `/orderbook/{marketId}` | GET | Bid/ask depth |
| `/trading-status` | GET | Check if exchange is active |

**Trading:**
| Endpoint | Method | Purpose |
|---|---|---|
| `/orders` | POST | Create buy/sell order (returns unsigned tx) |
| `/orders/status/{orderPubkey}` | GET | Poll order status |
| `/positions` | GET | All open positions with P&L |
| `/positions/{positionPubkey}` | DELETE | Close/sell a position |
| `/positions/{positionPubkey}/claim` | POST | Claim winnings after settlement |

**Social (built-in by Jupiter):**
| Endpoint | Method | Purpose |
|---|---|---|
| `/profiles/{pubkey}` | GET | PnL, volume, prediction count |
| `/profiles/{pubkey}/pnl-history` | GET | Time-series P&L |
| `/trades` | GET | Platform-wide trade feed |
| `/leaderboards` | GET | Rankings by PnL, volume, win rate |
| `/follow/{pubkey}` | POST | Follow a predictor |
| `/unfollow/{pubkey}` | DELETE | Unfollow |
| `/followers/{pubkey}` | GET | Follower list |
| `/following/{pubkey}` | GET | Following list |

**Auth:** All requests require `x-api-key` header from [portal.jup.ag](https://portal.jup.ag).

**Price convention:** 1,000,000 native units = $1.00 USD (USDC or JupUSD).

**Deposit mints:**
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- JupUSD: `JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD`

### Transaction flow (with fee capture)

```typescript
// Simplified order creation with fee injection
async function createOrderWithFees(
  userPubkey: PublicKey,
  marketId: string,
  isYes: boolean,
  totalAmount: number,             // user's intended bet in native units
  broadcasterPubkey?: PublicKey     // who referred this trade (null if organic)
) {
  const PLATFORM_FEE_BPS = 200;    // 2%
  const BROADCASTER_FEE_BPS = 100; // 1%

  const platformFee = Math.floor(totalAmount * PLATFORM_FEE_BPS / 10000);
  const broadcasterFee = broadcasterPubkey
    ? Math.floor(totalAmount * BROADCASTER_FEE_BPS / 10000)
    : 0;
  const depositAmount = totalAmount - platformFee - broadcasterFee;

  // 1. Call Jupiter Prediction API
  const jupResponse = await jupiterFetch('/prediction/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownerPubkey: userPubkey.toBase58(),
      marketId,
      isYes,
      isBuy: true,
      depositAmount: depositAmount.toString(),
      depositMint: USDC_MINT.toBase58(),
    }),
  });

  // 2. Build fee transfer instructions
  const feeInstructions = [
    createTransferInstruction(userUsdcAta, platformUsdcAta, userPubkey, platformFee),
  ];

  if (broadcasterPubkey && broadcasterFee > 0) {
    const broadcasterAta = await getAssociatedTokenAddress(USDC_MINT, broadcasterPubkey);
    feeInstructions.push(
      createTransferInstruction(userUsdcAta, broadcasterAta, userPubkey, broadcasterFee)
    );
  }

  // 3. Combine into single transaction or Jito bundle
  // Option A: Inject instructions into Jupiter's transaction
  // Option B: Jito bundle (fee tx + Jupiter tx, atomic)

  return { transaction, breakdown: { depositAmount, platformFee, broadcasterFee } };
}
```

### Data models

**User profile (our database, extends Jupiter's /profiles):**
```
users
+-- pubkey (primary key)
+-- username
+-- avatar_url
+-- conviction_score
+-- total_earned_from_followers
+-- total_broadcasts
+-- accuracy_rate
+-- device_type (seeker | web)
+-- fcm_token (for push notifications)
+-- created_at
+-- updated_at
```

**Broadcast:**
```
broadcasts
+-- id (primary key)
+-- user_pubkey
+-- market_id
+-- event_id
+-- side (YES/NO)
+-- entry_price
+-- amount
+-- order_pubkey (on-chain reference)
+-- tx_signature
+-- follower_count
+-- counter_count
+-- created_at
+-- resolved_at
```

**Trade attribution:**
```
attributions
+-- id (primary key)
+-- trade_tx_signature
+-- trader_pubkey (follower)
+-- broadcaster_pubkey
+-- broadcast_id (FK)
+-- market_id
+-- trade_amount
+-- platform_fee
+-- broadcaster_fee
+-- created_at
```

---

## Solving the Cold Start Problem

A social feed with 5 predictions is a ghost town. Strategies to seed content:

| Strategy | Implementation |
|---|---|
| **Bot-seeded feed** | A bot auto-broadcasts when markets move significantly ("This market just swung 30%"). Keeps feed alive before real users post. |
| **Points/rewards for early broadcasters** | First 1,000 users who broadcast earn bonus points or token allocation. Incentivize content creation from day 1. |
| **Seeker community targeting** | Seeker owners are an engaged, identifiable cohort. Target Seeker Discord/Telegram communities, Solana Mobile channels. |
| **KOL partnerships** | Get 5-10 crypto Twitter / Telegram personalities to use the app publicly. Their followers follow. |
| **Event-driven launches** | Launch around major events (elections, ETF decisions, sports finals) when prediction interest naturally spikes. |
| **Piggyback on Jupiter's social data** | Jupiter's API already has `/trades` (platform-wide feed) and `/leaderboards`. Surface this data to make the app feel active even before your own users post. |
| **Seeker airdrop / genesis token tie-in** | Offer exclusive rewards or features to Seeker device holders verified via device attestation. Creates exclusivity and early adoption incentive. |

---

## Constraints and Risks

### Geo-restriction
Jupiter Prediction API blocks **US and South Korea** IPs. Target audience must be non-US crypto-native users. This is still a massive market (Europe, SEA, LATAM, MENA) but a real constraint.

### API beta status
Jupiter's Prediction API is in beta — subject to breaking changes without notice. Mitigation: abstract the Jupiter layer behind an internal service, so API changes only require updating one module.

### Liquidity dependency
Fully dependent on Jupiter for liquidity (which aggregates from Polymarket + Kalshi). If Jupiter's prediction product loses traction or shuts down, the app dies. Mitigation: architect to support multiple prediction market backends in the future.

### Slow feedback loops
Predictions can take days/weeks/months to resolve. Unlike memecoins (instant dopamine), engagement may stall between resolution events. Mitigation: "Closing soon" filter, active trade feed, counter-prediction debates, and push notifications keep users engaged between resolutions.

### Seeker install base
Seeker has a smaller user base than general Android or iOS. Mitigation: the web version ensures anyone with a Solana wallet can use the platform. Seeker is the primary channel but not the only one. Future Google Play listing expands to all Android users.

### Transaction injection risks
Injecting fee instructions into Jupiter's unsigned transactions may break if Jupiter changes their transaction format or uses complex address lookup tables. Mitigation: Jito bundle approach as fallback (two separate atomic transactions). Test both approaches and maintain both code paths.

---

## Feature Roadmap

### Phase 1: Seeker App MVP

| Feature | Priority | Description |
|---|---|---|
| Prediction feed | P0 | Browse broadcasts sorted by trending/new/closing soon |
| Seed Vault wallet integration | P0 | MWA + Seed Vault for hardware-secured signing |
| One-tap YES/NO trading | P0 | Buy with fee breakdown, single signature via Seed Vault |
| Auto-broadcast on trade | P0 | Every trade generates a shareable broadcast card |
| Counter-predictions | P0 | Take the opposite side of any broadcast |
| Portfolio + P&L view | P0 | Track open positions and realized gains |
| Platform fee capture | P0 | 2% fee via transaction injection |
| Broadcaster fee sharing | P0 | 1% to broadcaster on attributed trades |
| Push notifications | P0 | FCM-based alerts for market moves, resolutions, follower activity |
| SOL -> USDC swap (on-ramp) | P0 | Via Jupiter Ultra Swap with referral fees |
| dApp Store listing | P0 | Published on Solana dApp Store (0% commission) |

### Phase 2: Web App + Growth

| Feature | Priority | Description |
|---|---|---|
| Web app launch | P1 | React web app with wallet adapter (Phantom, Backpack, etc.) |
| Conviction score | P1 | Weighted reputation algorithm |
| Follow predictors | P1 | Follow feed of people you track |
| Shareable result cards | P1 | "I called it" cards for wins, optimized for X/social sharing |
| Broadcaster earnings dashboard | P1 | See how much you've earned from followers |
| Price alerts + watchlists | P1 | "Notify me when this market drops below $0.30" |
| Fiat on-ramp | P1 | Moonpay/Transak for card -> USDC |
| Category filtering | P1 | Crypto, sports, politics, etc. |

### Phase 3: Scale

| Feature | Priority | Description |
|---|---|---|
| Google Play listing | P2 | Broader Android distribution beyond Seeker |
| Global leaderboards | P2 | Opt-in competitive rankings |
| Premium tier | P2 | Advanced analytics, unlimited follows, priority alerts |
| Sponsored/promoted markets | P2 | Revenue from projects promoting their markets |
| Multi-backend support | P3 | Support prediction markets beyond Jupiter |

---

## Competitive Landscape

| Platform | What it does | What it lacks |
|---|---|---|
| Polymarket | Largest prediction market, deep liquidity | Zero social layer, desktop-first, no mobile UX |
| Jupiter Prediction | On-chain, aggregates Polymarket + Kalshi | Trading terminal UI, no social features beyond basic profiles |
| Kalshi | Regulated (US), real-money predictions | Centralized, no crypto integration, no social |
| **This app** | Social-first, real money, mobile-native, broadcaster incentives | New entrant, cold start challenge |

### Our edge
Nobody combines: **(1)** social feed UX **(2)** real money on-chain **(3)** broadcaster fee incentives **(4)** Solana-native mobile distribution via Seeker. Each competitor has 1-2 of these. We have all four.

---

## Success Metrics

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| MAU (Seeker + Web) | 5,000 | 25,000 |
| Daily broadcasts | 200 | 2,000 |
| Monthly trading volume | $500K | $5M |
| Platform fee revenue | $10K/mo | $100K/mo |
| Broadcaster earnings (total) | $5K/mo | $50K/mo |
| Retention (D7) | 30% | 40% |
| Avg. trades per user per week | 3 | 5 |
| Seeker dApp Store rating | 4.5+ | 4.5+ |
