import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tx_ref,
      amount,
      currency,
      payment_options,
      redirect_url,
      customer,
      meta,
      customizations,
    } = body;

    const flutterSecret = process.env.FLUTTER;
    if (!flutterSecret) {
      console.error('FLUTTER environment variable not set');
      return NextResponse.json({ error: "Server misconfigured - missing payment credentials" }, { status: 500 });
    }

    // Initialize payment with Flutterwave
    const flutterwavePayload = {
      tx_ref,
      amount,
      currency,
      payment_options,
      redirect_url,
      customer,
      meta,
      customizations,
    };

    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${flutterSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flutterwavePayload),
    });

    const result = await res.json();
    
    if (!res.ok) {
      console.error("Flutterwave error:", result);
      return NextResponse.json(result, { status: res.status });
    }

    // Return checkout link to client
    return NextResponse.json({
      link: result.data.link,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
