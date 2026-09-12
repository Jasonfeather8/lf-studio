import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FUNCTION_NAME = "sync-bunny-thumbnail";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidHttpsUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.startsWith("https://")) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const bunnyApiKey = Deno.env.get("BUNNY_STREAM_API_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !bunnyApiKey) {
      console.error(`[${FUNCTION_NAME}] Missing server configuration`);
      return response({ error: "Thumbnail sync is not configured" }, 500);
    }

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
    if (authError || !user) return response({ error: "Authentication required" }, 401);

    let payload: unknown;
    try { payload = await req.json(); } catch { return response({ error: "Invalid JSON body" }, 400); }
    if (!isRecord(payload) || typeof payload.exerciseId !== "string" || !uuidPattern.test(payload.exerciseId)) {
      return response({ error: "Invalid exercise video data" }, 400);
    }
    const exerciseId = payload.exerciseId;

    const { data: video, error: videoError } = await callerClient
      .from("exercise_videos")
      .select("id, exercise_id, bunny_video_id, bunny_library_id, thumbnail_url")
      .eq("exercise_id", exerciseId)
      .maybeSingle();
    if (videoError) {
      console.error(`[${FUNCTION_NAME}] Accessible video lookup failed`);
      return response({ error: "Unable to read exercise video" }, 500);
    }
    if (!video) return response({ error: "Exercise video is not accessible" }, 404);
    if (typeof video.id !== "string" || typeof video.exercise_id !== "string" || video.exercise_id !== exerciseId
      || typeof video.bunny_video_id !== "string" || !uuidPattern.test(video.bunny_video_id)
      || typeof video.bunny_library_id !== "string" || !video.bunny_library_id) {
      console.error(`[${FUNCTION_NAME}] Accessible video data is invalid`);
      return response({ error: "Invalid exercise video data" }, 500);
    }

    const bunnyUrl = `https://video.bunnycdn.com/library/${encodeURIComponent(video.bunny_library_id)}/videos/${encodeURIComponent(video.bunny_video_id)}`;
    let metadata: unknown;
    try {
      const bunnyResponse = await fetch(bunnyUrl, { headers: { AccessKey: bunnyApiKey } });
      if (!bunnyResponse.ok) {
        console.error(`[${FUNCTION_NAME}] Bunny thumbnail metadata lookup failed`, { status: bunnyResponse.status });
        return response({ error: "Unable to retrieve video thumbnail" }, 502);
      }
      metadata = await bunnyResponse.json();
    } catch {
      console.error(`[${FUNCTION_NAME}] Bunny thumbnail metadata lookup failed`);
      return response({ error: "Unable to retrieve video thumbnail" }, 502);
    }

    const thumbnailUrl = isRecord(metadata) ? metadata.thumbnailUrl : undefined;
    if (!isValidHttpsUrl(thumbnailUrl)) {
      console.error(`[${FUNCTION_NAME}] Bunny returned an invalid thumbnail URL`);
      return response({ error: "Video thumbnail is unavailable" }, 502);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: updatedVideo, error: updateError } = await serviceClient
      .from("exercise_videos")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", video.id)
      .eq("exercise_id", exerciseId)
      .eq("bunny_video_id", video.bunny_video_id)
      .eq("bunny_library_id", video.bunny_library_id)
      .select("id")
      .maybeSingle();
    if (updateError || !updatedVideo) {
      console.error(`[${FUNCTION_NAME}] Thumbnail persistence failed`);
      return response({ error: "Unable to persist video thumbnail" }, 500);
    }

    console.log(`[${FUNCTION_NAME}] Thumbnail synchronized`, { exerciseId });
    return response({ thumbnailUrl }, 200);
  } catch {
    console.error(`[${FUNCTION_NAME}] Unexpected error`);
    return response({ error: "Unable to synchronize video thumbnail" }, 500);
  }
});
