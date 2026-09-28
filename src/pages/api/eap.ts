import type { APIRoute } from "astro";
import { getEapFile } from "../../lib/db";

// The EAP on file, as uploaded.
export const GET: APIRoute = () => {
  const file = getEapFile();
  if (!file) return new Response("No EAP on file", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "content-type": file.type,
      "content-disposition": `inline; filename="${file.name.replace(/["\\\r\n]/g, "_")}"`,
    },
  });
};
