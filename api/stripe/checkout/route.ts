import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local." },
      { status: 200 },
    );
  }

  const stripe = new Stripe(secret);
  const body = await request.json();
  const { title, unitAmount, quantity, day, slot, slotId, activitySlug, activityId } = body;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Si Supabase est configuré et l'utilisateur connecté, on crée une réservation "pending"
  let bookingId: string | null = null;
  if (isSupabaseConfigured && slotId && activityId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          activity_id: activityId,
          slot_id: slotId,
          participants_count: quantity,
          status: "pending",
          total_price_cents: unitAmount * quantity,
        })
        .select("id")
        .single();
      if (!error && data) bookingId = data.id;
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: title, description: `Créneau ${day} à ${slot}` },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      metadata: { bookingId: bookingId ?? "", activitySlug, day, slot, quantity: String(quantity) },
      success_url: `${siteUrl}/reservation/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/activite/${activitySlug}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Création de la session de paiement impossible." }, { status: 500 });
  }
}
