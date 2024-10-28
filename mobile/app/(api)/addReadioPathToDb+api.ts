import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const {path, readioId, userId} = await request.json()

        if (!path || !readioId || !userId) {
            return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        }

        const response = await sql`
            UPDATE readios
            SET basepath = ${path}
            WHERE id = ${readioId} AND clerk_id = ${userId}
            RETURNING *;
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}