export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const modelUrl =
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

  try {
    const upstream = await fetch(modelUrl, {
      method: req.method === "HEAD" ? "HEAD" : "GET",
      headers: { Accept: "application/octet-stream" },
      signal: AbortSignal.timeout(55000),
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Upstream model request failed", upstreamStatus: upstream.status });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.method === "HEAD") return res.status(200).end();

    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (bytes.byteLength < 1_000_000) {
      return res.status(502).json({ error: "Upstream returned an incomplete model" });
    }

    res.setHeader("Content-Length", String(bytes.byteLength));
    return res.status(200).end(bytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown model proxy error";
    return res.status(502).json({ error: "Could not download pose model", detail: message });
  }
}
