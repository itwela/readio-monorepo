import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    try {
        const { name, email, clerkId, topics } = await request.json();

        if (!name || !email || !clerkId || !topics || !Array.isArray(topics)) {
            return new Response(JSON.stringify({ error: 'Missing required fields or invalid topics format' }), { status: 400 });
        }

        // Fetch station IDs by name
        const stationIds = await Promise.all(
            topics.map(async (topicName: string) => {
                const result = await sql`
                    SELECT id FROM stations WHERE name = ${topicName};
                `;
                
                // If the station is found, return its ID; otherwise, return null
                return result.length > 0 ? result[0].id : null;
            })
        );

        // Filter out any topics that didn't match a station name
        const validStationIds = stationIds.filter((id) => id !== null);

        if (validStationIds.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid stations found for the provided topics' }), { status: 404 });
        }

        // Associate user (clerkId) with valid station IDs
        const response = await Promise.all(
            validStationIds.map(async (stationId: string) => {
                return await sql`
                    INSERT INTO station_clerks (
                        station_id,
                        clerk_id
                    )
                    VALUES (
                        ${stationId},
                        ${clerkId}
                    )
                    ON CONFLICT DO NOTHING
                    RETURNING *;
                `;
            })
        );

        return new Response(JSON.stringify({ data: response }), { status: 201 });

    } catch (error: any) {
        console.error('Error associating user with stations:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}