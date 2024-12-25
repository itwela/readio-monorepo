import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    const { clerkId, playlistId } = await request.json()
    
    if (!clerkId || !playlistId) {
        return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
    }

    try {

        const response = await sql`
            SELECT r.*
            FROM readios r
            JOIN playlist_readios pr ON r.id = pr.readio_id
            WHERE pr.playlist_id = ${playlistId} AND r.clerk_id = ${clerkId}
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}

