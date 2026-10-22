// Delivery options. Prices and times are placeholders to confirm with the owner and courier.

export type Destination = "GB" | "GH";

export type DeliveryRate = {
  country: string;
  label: string;
  /** Price in pence. */
  amount: number;
  /** Working days from dispatch, for in-stock pieces. */
  days: [number, number];
};

export const DELIVERY: Record<Destination, DeliveryRate> = {
  GB: { country: "United Kingdom", label: "UK tracked delivery", amount: 495, days: [2, 4] },
  GH: { country: "Ghana", label: "Tracked delivery to Ghana", amount: 2500, days: [7, 14] },
};

export function parseDestination(value: unknown): Destination | undefined {
  return value === "GB" || value === "GH" ? value : undefined;
}
