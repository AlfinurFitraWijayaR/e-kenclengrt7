import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call the insert_daily_fees function
    const { error } = await supabaseAdmin.rpc("insert_daily_fees");

    if (error) {
      console.error("Error inserting daily fees:", error);
      return NextResponse.json(
        { error: "Failed to insert daily fees", details: error.message },
        { status: 500 }
      );
    }

    // Log success
    const timestamp = new Date().toISOString();
    console.log(`Daily fees inserted successfully at ${timestamp}`);

    return NextResponse.json({
      success: true,
      message: "Daily fees inserted successfully",
      timestamp,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// For Vercel Cron configuration
export const runtime = "edge"; // or 'nodejs' if you prefer
