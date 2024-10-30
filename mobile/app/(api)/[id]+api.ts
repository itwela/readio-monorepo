import sql from "@/helpers/neonClient";

export async function GET(request: Request, {id}: { id: string }) {
    
    if (!id) {
        return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400, headers: {'Content-Type': 'application/json'}});
    }

    try {
        const stations = await sql`
            SELECT * FROM stations WHERE clerk_id = ${id}
        `;
        return new Response(JSON.stringify({ data: stations }), {status: 200, headers: {'Content-Type': 'application/json'}});
    } catch (error) {
        console.error('Error fetching or creating data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {status: 500, headers: {'Content-Type': 'application/json'}});
    }
}