import sql from '@/helpers/neonClient';

export async function POST(request: Request) {
  try {
    const { readioId, clerkId } = await request.json();

    if (!readioId || !clerkId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    console.log("Deleting radio from playlists:", readioId, clerkId);

    // Remove the selected radio from all playlists for the specified user
    const response = await sql`
      DELETE FROM playlist_readios
      WHERE readio_id = ${readioId} AND clerk_id = ${clerkId}
    `;

    return new Response(JSON.stringify({ data: response }), { status: 200 });
  } catch (error: any) {
    console.error("Error deleting radio from playlists:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
