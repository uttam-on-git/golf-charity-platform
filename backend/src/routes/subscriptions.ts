import { Router, Response, Request } from "express";
import Stripe from "stripe";
import stripe from "../config/stripe.js";
import supabase from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();

function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription,
): number | null {
  if (!subscription.items.data.length) {
    return null;
  }

  return subscription.items.data.reduce((latestPeriodEnd, item) => {
    return Math.max(latestPeriodEnd, item.current_period_end);
  }, 0);
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "active" | "cancelled" | "lapsed" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "cancelled";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "lapsed";
    default:
      return "lapsed";
  }
}

async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<void> {
  const renewsAt = getSubscriptionPeriodEnd(subscription);

  const updatePayload: Record<string, unknown> = {
    status: mapStripeSubscriptionStatus(subscription.status),
  };

  if (subscription.customer) {
    updatePayload.stripe_customer_id =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
  }

  updatePayload.renews_at = renewsAt
    ? new Date(renewsAt * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("subscriptions")
    .update(updatePayload)
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(
      `Failed to sync subscription ${subscription.id}: ${error.message}`,
    );
  }
}

async function saveSubscriptionRecord({
  userId,
  plan,
  status,
  customerId,
  subscriptionId,
  renewsAt,
}: {
  userId: string;
  plan: string;
  status: "active" | "cancelled" | "lapsed";
  customerId: string;
  subscriptionId: string;
  renewsAt: string;
}): Promise<void> {
  const payload = {
    user_id: userId,
    plan,
    status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    renews_at: renewsAt,
  };

  const { data: existingBySubscription, error: existingBySubscriptionError } =
    await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

  if (existingBySubscriptionError) {
    throw new Error(
      `Failed to check existing subscription by stripe_subscription_id: ${existingBySubscriptionError.message}`,
    );
  }

  if (existingBySubscription) {
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", existingBySubscription.id);

    if (updateError) {
      throw new Error(
        `Failed to update subscription by stripe_subscription_id: ${updateError.message}`,
      );
    }

    return;
  }

  const { data: existingByUser, error: existingByUserError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingByUserError) {
    throw new Error(
      `Failed to check existing subscription by user_id: ${existingByUserError.message}`,
    );
  }

  if (existingByUser) {
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", existingByUser.id);

    if (updateError) {
      throw new Error(
        `Failed to update subscription by user_id: ${updateError.message}`,
      );
    }

    return;
  }

  const { error: insertError } = await supabase
    .from("subscriptions")
    .insert(payload);

  if (insertError) {
    throw new Error(`Failed to insert subscription: ${insertError.message}`);
  }
}

// POST /api/subscriptions/checkout
// Creates a Stripe Checkout session
router.post(
  "/checkout",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { plan } = req.body;

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      res
        .status(400)
        .json({ success: false, error: "Plan must be monthly or yearly" });
      return;
    }

    const priceId =
      plan === "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID!
        : process.env.STRIPE_YEARLY_PRICE_ID!;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          user_id: req.user!.id,
          plan,
        },
        success_url: `${process.env.FRONTEND_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard/subscription?cancelled=true`,
      });

      res.json({ success: true, url: session.url });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Stripe error";
      res.status(500).json({ success: false, error: message });
    }
  },
);

// POST /api/subscriptions/confirm-session
// Fallback sync when checkout succeeded but webhook has not updated the DB yet
router.post(
  "/confirm-session",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { session_id } = req.body;

    if (!session_id || typeof session_id !== "string") {
      res.status(400).json({ success: false, error: "session_id is required" });
      return;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["subscription"],
      });

      if (session.metadata?.user_id !== req.user!.id) {
        res.status(403).json({ success: false, error: "Session does not belong to this user" });
        return;
      }

      const plan = session.metadata?.plan;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!plan || !subscriptionId || !customerId) {
        res.status(400).json({
          success: false,
          error: "Checkout session is missing subscription details",
        });
        return;
      }

      const stripeSub =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

      if (!stripeSub) {
        res.status(400).json({
          success: false,
          error: "Checkout session does not contain a subscription",
        });
        return;
      }

      const renewsAt = getSubscriptionPeriodEnd(stripeSub);

      if (!renewsAt) {
        res.status(400).json({
          success: false,
          error: "Subscription period end missing from Stripe response",
        });
        return;
      }

      await saveSubscriptionRecord({
        userId: req.user!.id,
        plan,
        status: mapStripeSubscriptionStatus(stripeSub.status),
        customerId,
        subscriptionId,
        renewsAt: new Date(renewsAt * 1000).toISOString(),
      });

      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", req.user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to load synced subscription: ${error.message}`);
      }

      res.json({ success: true, data: subscription ?? null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to confirm checkout session";
      res.status(500).json({ success: false, error: message });
    }
  },
);

// GET /api/subscriptions/me
// Get current user's subscription
router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({ success: true, data });
  },
);

// POST /api/subscriptions/cancel
// Cancel current subscription
router.post(
  "/cancel",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", req.user!.id)
      .eq("status", "active")
      .single();

    if (!sub) {
      res
        .status(404)
        .json({ success: false, error: "No active subscription found" });
      return;
    }

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      message: "Subscription cancelled at period end",
    });
  },
);

// POST /api/subscriptions/webhook
// Stripe webhook - updates DB when payment succeeds
router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    res.status(400).json({ error: "Webhook signature invalid" });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!userId || !plan || !subscriptionId || !customerId) {
        res
          .status(400)
          .json({ error: "Webhook payload missing subscription metadata" });
        return;
      }

      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const renewsAt = getSubscriptionPeriodEnd(stripeSub);

      if (!renewsAt) {
        res
          .status(400)
          .json({
            error: "Subscription period end missing from Stripe response",
          });
        return;
      }

      await saveSubscriptionRecord({
        userId,
        plan,
        status: mapStripeSubscriptionStatus(stripeSub.status),
        customerId,
        subscriptionId,
        renewsAt: new Date(renewsAt * 1000).toISOString(),
      });
    }

    if (event.type === "customer.subscription.updated") {
      const stripeSub = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(stripeSub);
    }

    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(stripeSub);
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "lapsed" })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          throw new Error(
            `Failed to mark subscription as lapsed: ${error.message}`,
          );
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook processing failed";
    console.error(
      `[subscriptions webhook] ${event.type} failed: ${message}`,
    );
    res.status(500).json({ error: message });
  }
});

export default router;
