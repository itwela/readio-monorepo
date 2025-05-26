import { NextResponse } from 'next/server';
import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    DeleteObjectCommand,
    DeleteBucketCommand,
    paginateListObjectsV2,
    GetObjectCommand,
  } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();
import sql from "../../neonClient";

const s3Client = new S3Client({});


export async function POST(request: Request) {
  console.log('🚀 Starting article generation API');

  try {
    const body = await request.json();
    const { form, user, apiKey } = body;

    const recent = await sql`
      SELECT * FROM request_locks
      WHERE user_id = ${user.id}
      AND content_type = 'article'
      AND created_at > NOW() - INTERVAL '60 seconds'
    `;

    if (recent.length > 0) {
      return NextResponse.json({ success: false, duplicate: true }, { status: 429 });
    }

    await sql`
      INSERT INTO request_locks (user_id, content_type)
      VALUES (${user.id}, 'article')
      ON CONFLICT (user_id, content_type)
      DO UPDATE SET created_at = NOW()
    `;

    // const result = await handleGenerateArticleReplicate({
    //   form,
    //   user,
    //   clients: { s3Client },
    //   apiKey,
    // });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('❌ Error in article generation API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 