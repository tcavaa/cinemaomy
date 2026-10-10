import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/db/enums";
import { BOOKING_STATUS_LABEL } from "../../seat-kinds";

const TONE: Record<BookingStatus, BadgeTone> = {
  paid: "green",
  pending: "amber",
  conflict: "vermilion",
  refunded: "neutral",
  expired: "neutral",
  cancelled: "neutral",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={TONE[status]}>{BOOKING_STATUS_LABEL[status]}</Badge>;
}
