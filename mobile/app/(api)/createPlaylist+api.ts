import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    try {
        const { clerkId, name, selections } = await request.json();

        if (!clerkId || !name || !selections || selections.length === 0) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Step 1: Insert the new playlist
        const [newPlaylist] = await sql`
            INSERT INTO playlists (
                name,
                clerk_id
            )
            VALUES (
                ${name},
                ${clerkId}
            )
            RETURNING id, name;
        `;

        // Step 2: Associate readios with the new playlist
        const playlistId = newPlaylist.id;

        // Use `Promise.all` to insert associations in bulk
        const readioAssociations = await Promise.all(
            selections.map(async (selection: { id: number, name: string }) => {
                return await sql`
                    INSERT INTO playlist_readios (
                        playlist_id,
                        readio_id
                    )
                    VALUES (
                        ${playlistId},
                        ${selection.id}
                    )
                    RETURNING *;
                `;
            })
        );

        return new Response(
            JSON.stringify({ playlist: newPlaylist, associations: readioAssociations }),
            { status: 201 }
        );
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
