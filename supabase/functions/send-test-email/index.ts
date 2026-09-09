import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FROM = "onboarding@resend.dev";
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 200;
const MAX_HTML_LENGTH = 100_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const jsonResponse = (body: Record<string, boolean | string>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateEmail = (value: unknown, field: string): string => {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const email = value.trim();
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH || !emailPattern.test(email)) {
    throw new Error(`${field} must be a valid email`);
  }
  return email;
};

const validatePayload = (payload: unknown) => {
  if (!isRecord(payload)) throw new Error("Request body must be an object");

  const allowedFields = new Set(["to", "from", "subject", "html"]);
  if (Object.keys(payload).some((field) => !allowedFields.has(field))) {
    throw new Error("Request body contains unsupported fields");
  }

  const to = validateEmail(payload.to, "to");
  const from = payload.from === undefined ? DEFAULT_FROM : validateEmail(payload.from, "from");

  if (typeof payload.subject !== "string") throw new Error("subject must be a string");
  const subject = payload.subject.trim();
  if (
    subject.length === 0 ||
    subject.length > MAX_SUBJECT_LENGTH ||
    /[\r\n]/.test(subject)
  ) {
    throw new Error("subject is invalid");
  }

  if (typeof payload.html !== "string") throw new Error("html must be a string");
  if (payload.html.trim().length === 0 || payload.html.length > MAX_HTML_LENGTH) {
    throw new Error("html is invalid");
  }

  return { to, from, subject, html: payload.html };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) {
      console.warn("[send-test-email] Missing bearer token");
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      console.warn("[send-test-email] Empty bearer token");
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn("[send-test-email] Invalid bearer token");
      return jsonResponse({ error: "Authentication required" }, 401);
    }

    const isSuperAdmin =
      user.app_metadata?.role === "super_admin" ||
      user.user_metadata?.role === "super_admin";
    if (!isSuperAdmin) {
      console.warn("[send-test-email] Forbidden role");
      return jsonResponse({ error: "Super admin access required" }, 403);
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    let emailData;
    try {
      emailData = validatePayload(payload);
    } catch {
      return jsonResponse({ error: "Invalid email data" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-test-email] Resend API key is not configured");
      return jsonResponse({ error: "Email service is not configured" }, 500);
    }

    let resendResponse: Response;
    try {
      resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
    } catch {
      console.error("[send-test-email] Resend request failed");
      return jsonResponse({ error: "Email provider unavailable" }, 502);
    }

    if (!resendResponse.ok) {
      console.error("[send-test-email] Resend rejected request", { status: resendResponse.status });
      return jsonResponse({ error: "Email provider rejected the request" }, 502);
    }

    console.log("[send-test-email] Test email sent");
    return jsonResponse({ success: true }, 200);
  } catch {
    console.error("[send-test-email] Unexpected error");
    return jsonResponse({ error: "Unable to send test email" }, 500);
  }
});
