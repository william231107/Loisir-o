import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

// Génère un identifiant de billet court et lisible
function makeQrCode() {
  return "LOIS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ received: true, note: "Stripe non configuré." });
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature!, webhookSecret);
  } catch (err) {
    console.error("Signature webhook invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId && isAdminConfigured) {
      const admin = createAdminClient();

      // 1. Confirme la réservation (le trigger SQL décrémente la capacité du créneau)
      await admin
        .from("bookings")
        .update({ status: "confirmed", qr_code: makeQrCode() })
        .eq("id", bookingId);

      // 2. Enregistre le paiement
      await admin.from("payments").insert({
        booking_id: bookingId,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        amount_cents: session.amount_total ?? 0,
        status: "paid",
      });

      // 3. Notifie l'utilisateur
      const { data: booking } = await admin
        .from("bookings")
        .select("user_id")
        .eq("id", bookingId)
        .single();
      if (booking?.user_id) {
        await admin.from("notifications").insert({
          user_id: booking.user_id,
          type: "booking_confirmed",
          title: "Réservation confirmée",
          body: "Votre paiement a bien été reçu. Présentez votre billet à l'accueil.",
        });
      }
      // TODO : déclencher l'email de confirmation (Resend) ici.
    }
  }

  if (event.type === "charge.refunded" && isAdminConfigured) {
    const charge = event.data.object as Stripe.Charge;
    const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
    if (pi) {
      const admin = createAdminClient();
      const { data: payment } = await admin
        .from("payments")
        .update({ status: "refunded", refunded_amount_cents: charge.amount_refunded })
        .eq("stripe_payment_intent_id", pi)
        .select("booking_id")
        .single();
      if (payment?.booking_id) {
        await admin.from("bookings").update({ status: "refunded" }).eq("id", payment.booking_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
