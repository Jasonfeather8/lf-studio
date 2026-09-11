import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FUNCTION_NAME = "bunny-webhook";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bunnystream-signature-version, x-bunnystream-signature-algorithm, x-bunnystream-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: Record<string, unknown>, status: number) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const header = (request: Request, names: string[]) => names.map((name) => request.headers.get(name)).find((value) => !!value)?.trim() ?? "";

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
};

const hexToBytes = (value: string): Uint8Array | null => {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return bytes;
};

const hmac = async (body: Uint8Array, key: string): Promise<Uint8Array> => {
  const cryptoKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, body));
};

const getField = (payload: Record<string, unknown>, names: string[]) => names.map((name) => payload[name]).find((value) => value !== undefined);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const version = header(req, ["X-BunnyStream-Signature-Version"]);
    const algorithm = header(req, ["X-BunnyStream-Signature-Algorithm"]).toLowerCase();
    const signatureHeader = header(req, ["X-BunnyStream-Signature"]);
    if (version !== "v1" || algorithm !== "hmac-sha256" || !signatureHeader) return response({ error: "Invalid webhook signature metadata" }, 401);

    const bodyBytes = new Uint8Array(await req.arrayBuffer());
    const readOnlyKey = Deno.env.get("BUNNY_STREAM_READ_ONLY_API_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const libraryId = Deno.env.get("BUNNY_STREAM_LIBRARY_ID") ?? "";
    if (!readOnlyKey || !serviceRoleKey || !supabaseUrl || !libraryId) {
      console.error(`[${FUNCTION_NAME}] Missing server configuration`);
      return response({ error: "Webhook is not configured" }, 500);
    }

    const suppliedSignature = signatureHeader.trim();
    const expectedSignature = await hmac(bodyBytes, readOnlyKey);
    const receivedBytes = /^[0-9a-f]{64}$/i.test(suppliedSignature) ? hexToBytes(suppliedSignature) : null;
    if (!receivedBytes || !bytesEqual(expectedSignature, receivedBytes)) return response({ error: "Invalid webhook signature" }, 401);

    let payload: unknown;
    try { payload = JSON.parse(new TextDecoder().decode(bodyBytes)); } catch { return response({ error: "Invalid JSON body" }, 400); }
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) return response({ error: "Invalid webhook body" }, 400);
    const record = payload as Record<string, unknown>;
    const videoId = getField(record, ["VideoGuid", "videoGuid", "video_guid"]);
    const incomingLibraryId = getField(record, ["VideoLibraryId", "videoLibraryId", "video_library_id"]);
    const status = getField(record, ["Status", "status"]);
    if (typeof videoId !== "string" || !uuidPattern.test(videoId) || String(incomingLibraryId) !== libraryId || typeof status !== "number" || !Number.isInteger(status)) {
      return response({ error: "Invalid webhook video data" }, 400);
    }

    const statusLabel = status === 3 ? "Concluído" : [5, 8].includes(status) ? "Erro" : [0, 1, 2, 6, 7].includes(status) ? "Processando" : "Indisponível";
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await serviceClient
      .from("exercise_videos")
      .update({ bunny_status: status, bunny_status_label: statusLabel, updated_at: new Date().toISOString() })
      .eq("bunny_video_id", videoId)
      .eq("bunny_library_id", libraryId)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error(`[${FUNCTION_NAME}] Status update failed`);
      return response({ error: "Unable to update video status" }, 500);
    }

    console.log(`[${FUNCTION_NAME}] Webhook processed`, { matched: !!data, status });
    return response({ ok: true }, 200);
  } catch {
    console.error(`[${FUNCTION_NAME}] Unexpected error`);
    return response({ error: "Unable to process webhook" }, 500);
  }
});
