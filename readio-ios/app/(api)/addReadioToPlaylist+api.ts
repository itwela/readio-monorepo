import sql from '@/helpers/neonClient';

export async function POST(request: Request) {
  try {
    const { readioId, readioName, clerkId, playlistInfo } = await request.json();

    if (!readioId || !clerkId || !playlistInfo || playlistInfo.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields or playlistInfo is empty' }), { status: 400 });
    }

    // Insert each selected playlist into `playlist_readios`
    const insertPromises = playlistInfo.map((playlist: { id: number, name: string }) =>
      sql`
        INSERT INTO playlist_readios (playlist_id, readio_id, playlist, readio, clerk_id)
        VALUES (${playlist.id}, ${readioId}, ${playlist.name}, ${readioName}, ${clerkId})
        ON CONFLICT DO NOTHING
      `
    );

    // Execute all insertions in parallel
    const response = await Promise.all(insertPromises);

    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}