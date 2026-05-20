type HelperPayload = {
  sectionKey?: string;
  sectionLabel?: string;
  targetField?: string;
  fieldValue?: string;
  project?: Record<string, unknown>;
  selectedFolder?: Record<string, unknown>;
  siteDetails?: unknown[];
  serviceClassifications?: unknown[];
  manual?: Record<string, unknown>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function compactPayload(payload: HelperPayload) {
  return {
    sectionKey: payload.sectionKey || "",
    sectionLabel: payload.sectionLabel || "",
    targetField: payload.targetField || "",
    currentFieldValue: payload.fieldValue || "",
    project: payload.project || {},
    selectedFolder: payload.selectedFolder || {},
    siteDetails: payload.siteDetails || [],
    serviceClassifications: payload.serviceClassifications || [],
    manual: payload.manual || {},
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return jsonResponse({ error: "OPENAI_API_KEY is not set in Supabase Edge Function secrets." }, 500);

  const payload = (await request.json().catch(() => null)) as HelperPayload | null;
  if (!payload) return jsonResponse({ error: "Invalid request payload." }, 400);

  const model = Deno.env.get("OPENAI_MODEL") || "gpt-5.4";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "You are an Australian operations and maintenance manual assistant. Write concise, professional O&M content using Australian English, Australian construction terminology, and practical asset handover language. Do not invent legal certifications, warranties, or compliance claims. If Australian Standards are relevant, refer generally to applicable Australian Standards and manufacturer requirements unless a specific standard is clearly supported by the supplied data. Return JSON only.",
      input: [
        {
          role: "user",
          content: JSON.stringify(compactPayload(payload)),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "om_manual_helper_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              suggestion: {
                type: "string",
                description: "Suggested text for the selected field or section.",
              },
              notes: {
                type: "array",
                items: { type: "string" },
                description: "Short cautions or assumptions for the user.",
              },
            },
            required: ["suggestion", "notes"],
          },
        },
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return jsonResponse({ error: data.error?.message || "OpenAI request failed." }, response.status);
  }

  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content || [])
      ?.map((content: { text?: string }) => content.text || "")
      ?.join("");

  try {
    return jsonResponse(JSON.parse(outputText || "{}"));
  } catch {
    return jsonResponse({ suggestion: outputText || "", notes: [], fieldUpdates: {} });
  }
});
