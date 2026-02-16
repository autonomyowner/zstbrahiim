import { NextRequest, NextResponse } from "next/server";

// Type for Cloudflare R2 binding
interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream, options?: { httpMetadata?: { contentType?: string } }): Promise<any>;
}

// Type for Cloudflare context environment
interface CloudflareEnv {
  R2_BUCKET?: R2Bucket;
}

async function getR2Bucket(): Promise<R2Bucket | null> {
  try {
    // Try to get R2 binding from Cloudflare context (production)
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext() as { env: CloudflareEnv };
    return env.R2_BUCKET || null;
  } catch {
    // Not running on Cloudflare (local dev) — fall back to S3
    return null;
  }
}

async function uploadViaS3(key: string, buffer: Buffer, contentType: string) {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const entityId = (formData.get("entityId") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `${folder}/${entityId}/${timestamp}-${random}.${ext}`;

    // Try R2 binding first (Cloudflare production), fall back to S3 API (local dev)
    const r2Bucket = await getR2Bucket();

    if (r2Bucket) {
      await r2Bucket.put(key, buffer.buffer as ArrayBuffer, {
        httpMetadata: { contentType: file.type },
      });
    } else {
      await uploadViaS3(key, buffer, file.type);
    }

    const publicUrl = `${process.env.R2_PUBLIC_URL || "https://pub-f997105a40ef4c4c82ce45ee4be0b31e.r2.dev"}/${key}`;

    return NextResponse.json({ url: publicUrl, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
