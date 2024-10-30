import sql from '@/helpers/neonClient'

export async function POST(request: Request) {
    
    try {
        const {path, readioId, userId} = await request.json()

        if (!path || !readioId || !userId) {
            return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        }

        const response = await sql`
            UPDATE readios
            SET url = ${path}
            WHERE id = ${readioId} AND clerk_id = ${userId}
            RETURNING *;
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}