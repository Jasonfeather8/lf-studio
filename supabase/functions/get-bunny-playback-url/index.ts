import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FUNCTION_NAME = "get-bunny-playback-url";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const libraryIdPattern = /^[0-9]+$/;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return response({ error: "Authentication required" }, 401);
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) return response({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const bunnyApiKey = Deno.env.get("BUNNY_STREAM_API_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !bunnyApiKey) {
      console.error(`[${FUNCTION_NAME}] Missing server configuration`);
      return response({ error: "Playback service is not configured" }, 500);
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
    if (authError || !user) return response({ error: "Authentication required" }, 401);

    let payload: unknown;
    try { payload = await req.json(); } catch { return response({ error: "Invalid JSON body" }, 400); }
    if (!isRecord(payload) || typeof payload.exerciseId !== "string" || !uuidPattern.test(payload.exerciseId)) {
      return response({ error: "Invalid exercise ID" }, 400);
    }
    const exerciseId = payload.exerciseId;

    const { data: video, error: videoError } = await callerClient
      .from("exercise_videos")
      .select("exercise_id, bunny_video_id, bunny_library_id, bunny_status")
      .eq("exercise_id", exerciseId)
      .eq("bunny_status", 3)
      .maybeSingle();
    if (videoError) {
      console.error(`[${FUNCTION_NAME}] Accessible video lookup failed`);
      return response({ error: "Unable to read exercise video" }, 500);
    }
    if (!video) return response({ error: "Exercise video is not accessible" }, 404);

    if (video.exercise_id !== exerciseId
      || typeof video.bunny_video_id !== "string" || !uuidPattern.test(video.bunny_video_id)
      || typeof video.bunny_library_id !== "string" || !libraryIdPattern.test(video.bunny_library_id)
      || video.bunny_status !== 3) {
      console.error(`[${FUNCTION_NAME}] Accessible video data is invalid`);
      return response({ error: "Invalid exercise video data" }, 500);
    }

    const expires = Math.floor(Date.now() / 1000) + 3600;
    const tokenHash = await sha256Hex(`${bunnyApiKey}${video.bunny_video_id}${expires}`);
    const playbackUrl = `https://iframe.mediadelivery.net/embed/${encodeURIComponent(video.bunny_library_id)}/${encodeURIComponent(video.bunny_video_id)}?token=${encodeURIComponent(tokenHash)}&expires=${expires}`;

    console.log(`[${FUNCTION_NAME}] Playback URL generated`, { exerciseId, userId: user.id });
    return response({ playbackUrl }, 200);
  } catch {
    console.error(`[${FUNCTION_NAME}] Unexpected error`);
    return response({ error: "Unable to generate video playback URL" }, 500);
  }
});
