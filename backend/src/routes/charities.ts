import { Router, Response } from "express";
import Stripe from "stripe";
import supabase from "../config/supabase.js";
import stripe from "../config/stripe.js";
import {
  authenticate,
  requireActiveSubscription,
  AuthRequest,
} from "../middleware/auth.js";

const router = Router();
const MIN_DONATION_GBP = 5;
const MAX_DONATION_GBP = 5000;

async function saveDonationRecord(
  session: Stripe.Checkout.Session,
): Promise<Record<string, unknown>> {
  const charityId = session.metadata?.charity_id;
  const donorName = session.metadata?.donor_name;
  const donorEmail = session.metadata?.donor_email;
  const amountGbp = Number(session.metadata?.amount_gbp);

  if (!charityId || !donorName || !donorEmail || !amountGbp) {
    throw new Error("Donation session metadata is incomplete");
  }

  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const payload = {
    charity_id: charityId,
    donor_name: donorName,
    donor_email: donorEmail,
    amount_gbp: amountGbp,
    status: session.payment_status === "paid" ? "completed" : "pending",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: stripePaymentIntentId,
    donated_at:
      session.payment_status === "paid" ? new Date().toISOString() : null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("charity_donations")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from("charity_donations")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update donation");
    }

    return data;
  }

  const { data, error } = await supabase
    .from("charity_donations")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to save donation");
  }

  return data;
}

// GET /api/charities - public, list all charities
router.get("/", async (req, res) => {
  const { search } = req.query;

  let query = supabase
    .from("charities")
    .select("*")
    .order("is_featured", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data });
});

// POST /api/charities/donations/confirm-session - finalize a successful one-off donation
router.post("/donations/confirm-session", async (req, res) => {
  const { session_id, charity_id } = req.body;

  if (!session_id || typeof session_id !== "string") {
    res.status(400).json({ success: false, error: "session_id is required" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.mode !== "payment") {
      res.status(400).json({
        success: false,
        error: "Session is not a donation payment session",
      });
      return;
    }

    if (
      charity_id &&
      typeof charity_id === "string" &&
      session.metadata?.charity_id !== charity_id
    ) {
      res.status(403).json({
        success: false,
        error: "Session does not belong to this charity",
      });
      return;
    }

    const donation = await saveDonationRecord(session);
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to confirm donation",
    });
  }
});

// GET /api/charities/:id - single charity
router.get("/:id", async (req, res) => {
  const [{ data: charity, error: charityError }, { data: events, error: eventsError }, { data: donations, error: donationsError }] =
    await Promise.all([
      supabase.from("charities").select("*").eq("id", req.params.id).single(),
      supabase
        .from("charity_events")
        .select("*")
        .eq("charity_id", req.params.id)
        .eq("is_published", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(6),
      supabase
        .from("charity_donations")
        .select("amount_gbp")
        .eq("charity_id", req.params.id)
        .eq("status", "completed"),
    ]);

  if (charityError || !charity) {
    res.status(404).json({ success: false, error: "Charity not found" });
    return;
  }

  if (eventsError || donationsError) {
    res.status(500).json({
      success: false,
      error: eventsError?.message || donationsError?.message || "Failed to load charity profile",
    });
    return;
  }

  const completedDonations = donations ?? [];
  const totalRaised = completedDonations.reduce((sum, donation) => {
    return sum + Number(donation.amount_gbp || 0);
  }, 0);

  res.json({
    success: true,
    data: {
      ...charity,
      upcoming_events: events ?? [],
      donation_summary: {
        total_raised_gbp: Number(totalRaised.toFixed(2)),
        donation_count: completedDonations.length,
      },
    },
  });
});

// POST /api/charities/:id/donations/checkout - create a public one-off donation checkout session
router.post("/:id/donations/checkout", async (req, res) => {
  const { donor_name, donor_email, amount_gbp } = req.body;

  const normalizedAmount = Number(amount_gbp);

  if (!donor_name || typeof donor_name !== "string") {
    res.status(400).json({ success: false, error: "donor_name is required" });
    return;
  }

  if (!donor_email || typeof donor_email !== "string") {
    res.status(400).json({ success: false, error: "donor_email is required" });
    return;
  }

  if (
    !Number.isFinite(normalizedAmount) ||
    normalizedAmount < MIN_DONATION_GBP ||
    normalizedAmount > MAX_DONATION_GBP
  ) {
    res.status(400).json({
      success: false,
      error: `Donation amount must be between £${MIN_DONATION_GBP} and £${MAX_DONATION_GBP}`,
    });
    return;
  }

  const { data: charity, error } = await supabase
    .from("charities")
    .select("id, name")
    .eq("id", req.params.id)
    .single();

  if (error || !charity) {
    res.status(404).json({ success: false, error: "Charity not found" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: donor_email,
      metadata: {
        charity_id: charity.id,
        donor_name: donor_name.trim(),
        donor_email: donor_email.trim(),
        amount_gbp: normalizedAmount.toFixed(2),
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(normalizedAmount * 100),
            product_data: {
              name: `Donation to ${charity.name}`,
              description: "Independent donation powered by GolfCharity",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/charities/${charity.id}?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/charities/${charity.id}?donation=cancelled`,
    });

    res.json({ success: true, url: session.url });
  } catch (stripeError) {
    res.status(500).json({
      success: false,
      error:
        stripeError instanceof Error ? stripeError.message : "Failed to create donation session",
    });
  }
});

// PUT /api/charities/select - user selects a charity (protected)
router.put(
  "/select",
  authenticate,
  requireActiveSubscription,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { charity_id, contribution_percent } = req.body;

    if (!charity_id) {
      res.status(400).json({ success: false, error: "charity_id is required" });
      return;
    }

    // Minimum 10%
    const percent = contribution_percent ?? 10;
    if (percent < 10 || percent > 100) {
      res
        .status(400)
        .json({
          success: false,
          error: "Contribution must be between 10% and 100%",
        });
      return;
    }

    // Check charity exists
    const { data: charity } = await supabase
      .from("charities")
      .select("id")
      .eq("id", charity_id)
      .single();

    if (!charity) {
      res.status(404).json({ success: false, error: "Charity not found" });
      return;
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        charity_id,
        contribution_percent: percent,
      })
      .eq("id", req.user!.id)
      .select("id, charity_id, contribution_percent")
      .maybeSingle();

    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }

    const { data: selectedCharity } = await supabase
      .from("charities")
      .select("id, name")
      .eq("id", charity_id)
      .maybeSingle();

    res.json({
      success: true,
      message: "Charity selection updated",
      data: {
        profile: updatedProfile,
        charity: selectedCharity ?? null,
      },
    });
  },
);

export default router;
