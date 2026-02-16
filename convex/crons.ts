import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Auto-close expired auctions every 5 minutes
crons.interval(
  "auto-close-expired-auctions",
  { minutes: 5 },
  internal.b2bOffers.autoCloseExpiredAuctions
);

// Notify about expiring auctions every hour
crons.interval(
  "notify-expiring-auctions",
  { hours: 1 },
  internal.b2bNotifications.notifyExpiringAuctions
);

export default crons;
