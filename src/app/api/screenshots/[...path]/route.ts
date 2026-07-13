import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

// This route serves screenshots locally during development
// In production, screenshots are served from GitHub raw URLs

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  const { path: pathSegments } = await params;

  // Reject suspicious segments outright
  if (
    pathSegments.some(
      (segment) => segment.includes("..") || segment.includes("\0")
    )
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Screenshots are stored in public/screenshots/ directory
  const publicDir = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(path.join(publicDir, ...pathSegments));

  // Confine resolved path to the public directory
  const relative = path.relative(publicDir, filePath);
  if (
    !relative ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const file = await fs.readFile(filePath);

    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = contentTypes[ext] ?? "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Screenshot not found" },
      { status: 404 }
    );
  }
}
