import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FUNCTION_NAME = "delete-bunny-video";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return jsonResponse({ error: "Authentication required" }, 401);
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) return jsonResponse({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const bunnyApiKey = Deno.env.get("BUNNY_STREAM_API_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !bunnyApiKey) {
      console.error(`[${FUNCTION_NAME}] Missing server configuration`);
      return jsonResponse({ error: "Video service is not configured" }, 500);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
    if (authError || !user) return jsonResponse({ error: "Authentication required" }, 401);

    let payload: unknown;
    try { payload = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
    if (!isRecord(payload) || typeof payload.exerciseId !== "string" || !uuidPattern.test(payload.exerciseId)) {
      return jsonResponse({ error: "Invalid exercise ID" }, 400);
    }
    const exerciseId = payload.exerciseId;

    const { data: profile, error: profileError } = await callerClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error(`[${FUNCTION_NAME}] Role lookup failed`);
      return jsonResponse({ error: "Unable to verify exercise management access" }, 500);
    }
    if (!profile || !["admin", "super_admin", "physio"].includes(profile.role)) {
      return jsonResponse({ error: "Exercise management access required" }, 403);
    }

    const { data: exercise, error: exerciseError } = await callerClient
      .from("exercises")
      .select("id, physio_id, status")
      .eq("id", exerciseId)
      .maybeSingle();
    if (exerciseError) {
      console.error(`[${FUNCTION_NAME}] Exercise lookup failed`);
      return jsonResponse({ error: "Unable to read exercise" }, 500);
    }
    if (!exercise || (profile.role === "physio" && exercise.physio_id !== user.id)) {
      return jsonResponse({ error: "Exercise is not accessible" }, 403);
    }

    const { data: video, error: videoError } = await callerClient
      .from("exercise_videos")
      .select("exercise_id, bunny_library_id, bunny_video_id")
      .eq("exercise_id", exercise.id)
      .maybeSingle();
    if (videoError) {
      console.error(`[${FUNCTION_NAME}] Video lookup failed`);
      return jsonResponse({ error: "Unable to read exercise video" }, 500);
    }
    if (video && (video.exercise_id !== exercise.id
      || typeof video.bunny_library_id !== "string"
      || !video.bunny_library_id.trim()
      || typeof video.bunny_video_id !== "string"
      || !video.bunny_video_id.trim())) {
      console.error(`[${FUNCTION_NAME}] Stored video data is invalid`);
      return jsonResponse({ error: "Invalid exercise video data" }, 500);
    }

    if (video) {
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${encodeURIComponent(video.bunny_library_id)}/videos/${encodeURIComponent(video.bunny_video_id)}`,
        {
          method: "DELETE",
          headers: { AccessKey: bunnyApiKey, accept: "application/json" },
        },
      );
      if (bunnyResponse.status !== 200 && bunnyResponse.status !== 404) {
        console.error(`[${FUNCTION_NAME}] Bunny video deletion failed`, { status: bunnyResponse.status });
        return jsonResponse({ error: "Video provider rejected the deletion" }, 502);
      }
    } else {
      console.log(`[${FUNCTION_NAME}] No stored Bunny video found`);
    }

    console.log(`[${FUNCTION_NAME}] Bunny video deletion completed`);
    return jsonResponse({ ok: true }, 200);
  } catch {
    console.error(`[${FUNCTION_NAME}] Unexpected error`);
    return jsonResponse({ error: "Unable to delete exercise video" }, 500);
  }
});
