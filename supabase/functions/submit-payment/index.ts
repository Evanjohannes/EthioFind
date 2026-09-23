import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { business_id, payment_method_id, amount, receipt_storage_path } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Confirm the caller actually owns this business before letting them submit a payment for it
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, owner_id")
      .eq("id", business_id)
      .single();

    if (bizError || !business) throw new Error("Business not found");
    if (business.owner_id !== user.id) throw new Error("You don't own this business");

    const { data, error } = await supabase
      .from("payments")
      .insert({
        business_id,
        payment_method_id,
        amount,
        receipt_storage_path,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ payment: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});