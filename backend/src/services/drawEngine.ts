import supabase from '../config/supabase.js';

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
  // Fetch all scores from active subscribers
  const { data: scores } = await supabase
    .from('golf_scores')
    .select('score, profiles!inner(subscriptions!inner(status))')
    .eq('profiles.subscriptions.status', 'active');

  if (!scores || scores.length === 0) {
    return generateRandom();
  }

  // Count frequency of each score
  const frequency: Record<number, number> = {};
  scores.forEach(({ score }) => {
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

// Match user scores against winning numbers
function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers);
  return userScores.filter(s => winningSet.has(s)).length;
}

// Run the full draw
export async function runDraw(mode: DrawMode, month: string): Promise<DrawResult> {
  const winning_numbers = await generateWinningNumbers(mode);

  // Get all active subscribers and their scores
  const { data: subscribers } = await supabase
    .from('profiles')
    .select(`
      id,
      subscriptions!inner(status),
      golf_scores(score)
    `)
    .eq('subscriptions.status', 'active');

  if (!subscribers || subscribers.length === 0) {
    return { winning_numbers, winners: [], jackpot_rolled_over: true };
  }

  const winners: DrawResult['winners'] = [];

  subscribers.forEach((user) => {
    const userScores = (user.golf_scores as { score: number }[]).map(s => s.score);
    if (userScores.length === 0) return;

    const matchCount = countMatches(userScores, winning_numbers);
    const matchedNumbers = userScores.filter(s => winning_numbers.includes(s));

    if (matchCount >= 5) {
      winners.push({ user_id: user.id, match_type: '5_match', matched_numbers: matchedNumbers });
    } else if (matchCount === 4) {
      winners.push({ user_id: user.id, match_type: '4_match', matched_numbers: matchedNumbers });
    } else if (matchCount === 3) {
      winners.push({ user_id: user.id, match_type: '3_match', matched_numbers: matchedNumbers });
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