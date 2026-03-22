export interface SubscriptionStateLike {
  status: string;
  renews_at?: string | null;
  stripe_subscription_id?: string | null;
  cancel_at_period_end?: boolean | null;
}

export function isSubscriptionCurrentlyActive(
  subscription: SubscriptionStateLike | null | undefined,
): boolean {
  if (!subscription) {
    return false;
  }

  if (!["active", "cancelled"].includes(subscription.status)) {
    return false;
  }

  if (!subscription.renews_at) {
    return subscription.status === "active" && Boolean(subscription.stripe_subscription_id);
  }

  return new Date(subscription.renews_at).getTime() > Date.now();
}

export function mapStripeSubscriptionStatus(
  subscription: Pick<SubscriptionStateLike, "status" | "cancel_at_period_end">,
): "active" | "cancelled" | "lapsed" {
  switch (subscription.status) {
    case "active":
    case "trialing":
      return subscription.cancel_at_period_end ? "cancelled" : "active";
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
