import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    
    try {
        const {readioId, clerkId} = await request.json()

        if (!readioId || !clerkId) {
            return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        }

        console.log("readioId: ", readioId)
        console.log("clerkId: ", clerkId)

        const response = await sql`
            DELETE FROM readios
            WHERE id = ${readioId} AND clerk_id = ${clerkId}
            RETURNING *;
        `;

        if (response.length === 0) {
            console.log("Readio not found")
            return new Response(JSON.stringify({error: 'Readio not found'}), {status: 404});
        }

        console.log("ok")
        return new Response(JSON.stringify({data: response}), {status: 200});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}