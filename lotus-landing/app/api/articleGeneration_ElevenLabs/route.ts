import dotenv from 'dotenv';
import { NextResponse } from 'next/server';
import sql from "../../neonClient";
dotenv.config();


export async function POST(request: Request) {
  console.log('🚀 Starting article generation API');

  try {
    const body = await request.json();
    const { user } = body;

    const recent = await sql`
      SELECT * FROM request_locks
      WHERE user_id = ${user.id}
      AND contentType = 'article'
      AND created_at > NOW() - INTERVAL '60 seconds'
    `;

    if (recent.length > 0) {
      return NextResponse.json({ success: false, duplicate: true }, { status: 429 });
    }

    await sql`
      INSERT INTO request_locks (user_id, contentType)
      VALUES (${user.id}, 'article')
      ON CONFLICT (user_id, contentType)
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