// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20", // その時点の最新API versionに合わせてね
});

export async function POST(req: NextRequest) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin ?? "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: "Mt. Fuji Shinkansen Pro Guide (lifetime access)",
            },
            // ¥1,200 → Stripe は「最小通貨単位」なので 1200 * 100
            unit_amount: 1200 * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "No session URL returned" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
