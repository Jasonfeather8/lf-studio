import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FUNCTION_NAME = "create-bunny-video";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const libraryId = Deno.env.get("BUNNY_STREAM_LIBRARY_ID") ?? "";
    const writeKey = Deno.env.get("BUNNY_STREAM_API_KEY") ?? "";
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !libraryId || !writeKey) {
      console.error(`[${FUNCTION_NAME}] Missing server configuration`);
      return jsonResponse({ error: "Video service is not configured" }, 500);
    }

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
    if (authError || !user) return jsonResponse({ error: "Authentication required" }, 401);

    let payload: unknown;
    try { payload = await req.json(); } catch { return jsonResponse({ error: "Invalid JSON body" }, 400); }
    if (!isRecord(payload) || typeof payload.exerciseId !== "string" || !uuidPattern.test(payload.exerciseId) || typeof payload.title !== "string") {
      return jsonResponse({ error: "Invalid video data" }, 400);
    }
    const title = payload.title.trim();
    if (!title || title.length > 200 || /[\u0000-\u001f\u007f]/.test(title)) return jsonResponse({ error: "Invalid video title" }, 400);

    const { data: profile, error: profileError } = await callerClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profileError || !profile || !["physio", "admin", "super_admin"].includes(profile.role)) {
      return jsonResponse({ error: "Exercise management access required" }, 403);
    }

    const { data: exercise, error: exerciseError } = await callerClient.from("exercises").select("id, physio_id, status").eq("id", payload.exerciseId).eq("status", "ativo").maybeSingle();
    if (exerciseError || !exercise) return jsonResponse({ error: "Exercise is not accessible" }, 403);
    if (profile.role === "physio" && exercise.physio_id !== user.id) return jsonResponse({ error: "Exercise management access required" }, 403);

    const bunnyResponse = await fetch(`https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos`, {
      method: "POST",
      headers: { AccessKey: writeKey, "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!bunnyResponse.ok) {
      console.error(`[${FUNCTION_NAME}] Bunny video creation failed`, { status: bunnyResponse.status });
      return jsonResponse({ error: "Video provider rejected the request" }, 502);
    }

    const bunnyVideo = await bunnyResponse.json() as { guid?: unknown; videoGuid?: unknown; id?: unknown };
    const videoId = [bunnyVideo.guid, bunnyVideo.videoGuid, bunnyVideo.id].find((value): value is string => typeof value === "string" && uuidPattern.test(value));
    if (!videoId) return jsonResponse({ error: "Video provider returned an invalid video ID" }, 502);

    const authorizationExpire = Math.floor(Date.now() / 1000) + 3600;
    const authorizationSignature = await sha256Hex(`${libraryId}${writeKey}${authorizationExpire}${videoId}`);
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { error: recordError } = await serviceClient.from("exercise_videos").upsert({
      exercise_id: exercise.id,
      bunny_video_id: videoId,
      bunny_library_id: libraryId,
      bunny_status: 0,
      bunny_status_label: "Enviando",
      updated_at: new Date().toISOString(),
    }, { onConflict: "exercise_id" });
    if (recordError) {
      console.error(`[${FUNCTION_NAME}] Bunny record persistence failed`);
      return jsonResponse({ error: "Unable to persist video status" }, 500);
    }

    console.log(`[${FUNCTION_NAME}] Upload authorization created`);
    return jsonResponse({ videoId, libraryId, authorizationSignature, authorizationExpire }, 200);
  } catch {
    console.error(`[${FUNCTION_NAME}] Unexpected error`);
    return jsonResponse({ error: "Unable to create video upload" }, 500);
  }
});
