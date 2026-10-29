# DineFlow - Real UPI & Payment Gateway Integration Guide
### Razorpay / PhonePe Webhook & Dynamic Tabletop UPI Architecture

This guide details how **DineFlow** integrates with real restaurant payment gateways (Razorpay, PhonePe, Paytm, Cashfree) and tabletop dynamic UPI for 100% automated bill settlement without waiter intervention.

---

## 1. System Architecture & Flow

```
[Diner Phone / Table QR]
         │
         ▼
[DineFlow App: "Request Bill"] 
         │
         ├── Method A: Direct Dynamic UPI QR (PhonePe / GPay / Paytm / BHIM)
         │       └── Diners scan 80mm printed receipt QR or tabletop modal QR
         │
         └── Method B: Razorpay Standard Checkout
                 │
                 ▼
         [Razorpay / PhonePe Servers]
                 │ (Payment Captured)
                 ▼
         [Supabase Edge Function / Webhook Endpoint]
                 │ (Verifies HMAC-SHA256 signature)
                 ▼
         [PostgreSQL Database: UPDATE orders SET payment_status = 'PAID']
                 │
                 ▼ (CDC Realtime WebSocket broadcast < 80ms)
         ┌───────────────────────┬────────────────────────┐
         ▼                       ▼                        ▼
  [Waiter POS Screen]     [Kitchen KDS]           [Customer Phone]
  "Table Settled & Free"  "Order Completed"       "Payment Confirmed"
```

---

## 2. Supabase Edge Function Webhook Handler (`supabase/functions/payment-webhook/index.ts`)

Deploy this function to your Supabase project to receive instant payment callbacks:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // 1. Verify Razorpay cryptographic webhook signature
    const expectedSignature = hmac("sha256", RAZORPAY_WEBHOOK_SECRET, rawBody, "utf8", "hex");
    if (signature !== expectedSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // 2. Process payment capture event
    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.notes?.order_id;
      const tenantId = payment.notes?.tenant_id || "the-urban-plate";
      const tableId = payment.notes?.table_id;

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // 3. Mark orders as PAID and COMPLETED
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "PAID",
            status: "COMPLETED",
            payment_method: payment.method || "UPI",
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);
      } else if (tableId) {
        // Settle all active table orders
        await supabase
          .from("orders")
          .update({ payment_status: "PAID", status: "COMPLETED" })
          .match({ tenant_id: tenantId, table_id: tableId })
          .neq("status", "CANCELLED");

        await supabase
          .from("bill_requests")
          .update({ status: "PAID" })
          .match({ tenant_id: tenantId, table_id: tableId });

        await supabase
          .from("tables")
          .update({ status: "available", manually_occupied: false })
          .match({ tenant_id: tenantId, id: tableId });
      }

      // 4. Log to Audit trail
      await supabase.from("audit_logs").insert({
        tenant_id: tenantId,
        category: "PAYMENT",
        action: "UPI Gateway Settle",
        details: `₹${(payment.amount / 100).toFixed(2)} received via ${payment.method} (${payment.vpa || payment.id}) for Table ${tableId}`,
        order_id: orderId || tableId,
        amount: payment.amount / 100,
        payment_method: payment.method || "UPI",
        severity: "info",
        security_flag: "✓ Gateway Verified"
      });

      return new Response(JSON.stringify({ status: "success", received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }

    return new Response(JSON.stringify({ status: "ignored" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
```

---

## 3. Dynamic UPI Intent String Format

DineFlow generates standard NPCI / UPI URL intents directly embedded in 80mm thermal receipts and on customer screen:

```
upi://pay?pa=restaurant.merchant@icici&pn=The%20Urban%20Plate&am=1450.00&cu=INR&tn=Table%20T04%20Bill&tr=ORD-9821
```

- `pa`: Restaurant Virtual Payment Address (VPA) / UPI ID
- `pn`: Restaurant Payee Display Name
- `am`: Exact Bill Amount with 2 decimal places
- `cu`: Currency (`INR`)
- `tn`: Transaction Note displayed to diner (`Table T04 Bill`)
- `tr`: Unique Order / Invoice tracking reference

Any UPI app (Google Pay, PhonePe, Paytm, Cred, BHIM) opens automatically and pre-populates the exact amount, preventing customer input errors.

