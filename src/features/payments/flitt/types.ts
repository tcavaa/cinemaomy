export type FlittOrderStatus =
  | "created"
  | "processing"
  | "declined"
  | "approved"
  | "expired"
  | "reversed";

/** Final payment result as sent in callbacks, redirects and status responses. */
export type FlittOrder = {
  order_id: string;
  merchant_id: number | string;
  order_status: FlittOrderStatus;
  response_status: "success" | "failure";
  amount?: number | string;
  actual_amount?: number | string;
  currency?: string;
  payment_id?: number | string;
  masked_card?: string;
  merchant_data?: string;
  response_code?: number | string;
  response_description?: string;
  signature?: string;
  [key: string]: unknown;
};

export type FlittFailure = {
  response_status: "failure";
  error_message: string;
  error_code: number | string;
  request_id?: string;
};

export type CheckoutTokenRequest = {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  email?: string;
  lifetimeSeconds: number;
  responseUrl?: string;
  serverCallbackUrl?: string;
  lang?: "en" | "ka";
};
