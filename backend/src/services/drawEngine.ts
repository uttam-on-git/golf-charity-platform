import supabase from '../config/supabase.js';
import { isSubscriptionCurrentlyActive } from '../utils/subscriptions.js';

type DrawMode = 'random' | 'algorithmic';

interface DrawResult {
  winning_numbers: number[];
  winners: {
    user_id: string;
    match_type: '3_match' | '4_match' | '5_match';
    matched_numbers: number[];
  }[];
  jackpot_rolled_over: boolean;
}

interface ScoreEntry {
  score: number;
  played_at?: string | null;
}

interface SubscriptionEntry {
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: string;
  renews_at?: string | null;
  stripe_subscription_id?: string | null;
}

interface ProfileContributionEntry {
  id: string;
  contribution_percent?: number | null;
}

export interface PrizePoolPreview {
  active_contributors: number;
  base_prize_pool_total: number;
  jackpot_carry_in: number;
  prize_pool_total: number;
}

export interface EligibleDrawParticipant {
  user_id: string;
  scores: number[];
}

const MONTHLY_PLAN_PRICE = Number.parseFloat(process.env.MONTHLY_PLAN_PRICE_GBP ?? '9.99');
const YEARLY_PLAN_PRICE = Number.parseFloat(process.env.YEARLY_PLAN_PRICE_GBP ?? '99.99');

// Generate 5 winning numbers
async function generateWinningNumbers(mode: DrawMode): Promise<number[]> {
  if (mode === 'random') {
    return generateRandom();
  }
  return generateAlgorithmic();
}

// Pure random - 5 unique numbers between 1-45
function generateRandom(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Algorithmic - weighted by most frequent scores across all users
async function generateAlgorithmic(): Promise<number[]> {
  const participants = await getEligibleDrawParticipants();
  const scores = participants.flatMap((participant) => participant.scores);

  if (!scores || scores.length === 0) {
    return generateRandom();
  }

  // Count frequency of each score
  const frequency: Record<number, number> = {};
  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  // Sort by frequency descending bias toward common scores
  const sorted = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .map(([score]) => parseInt(score));

  // Take top scores but add some randomness
  const pool = sorted.slice(0, 20);
  const numbers = new Set<number>();

  // Pick 3 from top frequent scores
  while (numbers.size < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(pool.length, 10));
    numbers.add(pool[idx]);
  }

  // Fill remaining 2 with random
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

function getLatestFiveScores(scores: ScoreEntry[]): number[] {
  return [...scores]
    .sort((left, right) => {
      const leftTime = left.played_at ? new Date(left.played_at).getTime() : 0;
      const rightTime = right.played_at ? new Date(right.played_at).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, 5)
    .map((entry) => entry.score);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getMonthlySubscriptionValue(plan: 'monthly' | 'yearly'): number {
  return plan === 'yearly' ? YEARLY_PLAN_PRICE / 12 : MONTHLY_PLAN_PRICE;
}

export async function getEligibleDrawParticipants(): Promise<EligibleDrawParticipant[]> {
  const { data: subscribers } = await supabase
    .from('profiles')
    .select(`
      id,
      subscriptions(status, renews_at, stripe_subscription_id, created_at),
      golf_scores(score, played_at)
    `);

  if (!subscribers || subscribers.length === 0) {
    return [];
  }

  return subscribers.flatMap((user) => {
    const latestSubscription = ((user.subscriptions as (SubscriptionEntry & { created_at?: string | null })[] | null) ?? [])
      .sort((left, right) => {
        const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
        const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
        return rightTime - leftTime;
      })[0];

    if (!isSubscriptionCurrentlyActive(latestSubscription)) {
      return [];
    }

    const scores = getLatestFiveScores((user.golf_scores as ScoreEntry[] | null) ?? []);
    if (scores.length < 5) {
      return [];
    }

    return [{ user_id: user.id, scores }];
  });
}

export async function calculatePrizePoolPreview(): Promise<PrizePoolPreview> {
  const [{ data: subscriptionRows, error: subscriptionError }, { data: latestPublishedDraw, error: drawError }] =
    await Promise.all([
      supabase
        .from('subscriptions')
        .select('user_id, plan, status, renews_at, stripe_subscription_id'),
      supabase
        .from('draws')
        .select('prize_pool_total, jackpot_rolled_over')
        .eq('status', 'published')
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (subscriptionError) {
    throw new Error(`Failed to load subscriptions for prize pool calculation: ${subscriptionError.message}`);
  }

  if (drawError) {
    throw new Error(`Failed to load latest published draw: ${drawError.message}`);
  }

  const activeSubscriptions = ((subscriptionRows ?? []) as SubscriptionEntry[]).filter(isSubscriptionCurrentlyActive);
  const contributorIds = [...new Set(activeSubscriptions.map((subscription) => subscription.user_id))];

  let profiles: ProfileContributionEntry[] = [];
  if (contributorIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, contribution_percent')
      .in('id', contributorIds);

    if (profileError) {
      throw new Error(`Failed to load profile contribution rates: ${profileError.message}`);
    }

    profiles = (profileRows ?? []) as ProfileContributionEntry[];
  }

  const contributionMap = new Map(
    profiles.map((profile) => [profile.id, profile.contribution_percent ?? 10]),
  );

  const basePrizePool = activeSubscriptions.reduce((sum, subscription) => {
    const planValue = getMonthlySubscriptionValue(subscription.plan);
    const contributionPercent = contributionMap.get(subscription.user_id) ?? 10;
    const prizeShare = planValue * ((100 - contributionPercent) / 100);
    return sum + prizeShare;
  }, 0);

  const jackpotCarryIn =
    latestPublishedDraw?.jackpot_rolled_over && latestPublishedDraw.prize_pool_total
      ? latestPublishedDraw.prize_pool_total * 0.4
      : 0;

  return {
    active_contributors: contributorIds.length,
    base_prize_pool_total: roundCurrency(basePrizePool),
    jackpot_carry_in: roundCurrency(jackpotCarryIn),
    prize_pool_total: roundCurrency(basePrizePool + jackpotCarryIn),
  };
}

// Match unique submitted numbers against unique winning numbers.
function getMatchedNumbers(userScores: number[], winningNumbers: number[]): number[] {
  const winningSet = new Set(winningNumbers);
  return [...new Set(userScores)]
    .filter((score) => winningSet.has(score))
    .sort((left, right) => left - right);
}

// Run the full draw
export async function runDraw(mode: DrawMode, month: string): Promise<DrawResult> {
  const winning_numbers = await generateWinningNumbers(mode);
  const subscribers = await getEligibleDrawParticipants();

  if (!subscribers || subscribers.length === 0) {
    return { winning_numbers, winners: [], jackpot_rolled_over: true };
  }

  const winners: DrawResult['winners'] = [];

  subscribers.forEach((user) => {
    const matchedNumbers = getMatchedNumbers(user.scores, winning_numbers);
    const matchCount = matchedNumbers.length;

    if (matchCount >= 5) {
      winners.push({ user_id: user.user_id, match_type: '5_match', matched_numbers: matchedNumbers });
    } else if (matchCount === 4) {
      winners.push({ user_id: user.user_id, match_type: '4_match', matched_numbers: matchedNumbers });
    } else if (matchCount === 3) {
      winners.push({ user_id: user.user_id, match_type: '3_match', matched_numbers: matchedNumbers });
    }
  });

  const jackpot_rolled_over = !winners.some(w => w.match_type === '5_match');

  return { winning_numbers, winners, jackpot_rolled_over };
}

// Calculate prize amounts
export async function calculatePrizes(
  drawId: string,
  prizePoolTotal: number
): Promise<void> {
  const { data: winners } = await supabase
    .from('winners')
    .select('*')
    .eq('draw_id', drawId);

  if (!winners || winners.length === 0) return;

  // Pool distribution per PRD
  const pools = {
    '5_match': prizePoolTotal * 0.40,
    '4_match': prizePoolTotal * 0.35,
    '3_match': prizePoolTotal * 0.25,
  };

  for (const matchType of ['5_match', '4_match', '3_match'] as const) {
    const matchWinners = winners.filter(w => w.match_type === matchType);
    if (matchWinners.length === 0) continue;

    // Split equally among winners in same tier
    const prizePerWinner = pools[matchType] / matchWinners.length;

    for (const winner of matchWinners) {
      await supabase
        .from('winners')
        .update({ prize_amount: prizePerWinner })
        .eq('id', winner.id);
    }
  }
}
