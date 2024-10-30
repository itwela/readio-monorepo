import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    
    try {
        const {name, email, clerkId, topics} = await request.json()

        if (!name || !email || !clerkId) {
            return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        }

        const response = await Promise.all(topics.map(async (topic: string) => {
            return await sql`
                INSERT INTO stations (
                    name, 
                    clerk_id
                )
                VALUES (
                    ${topic}, 
                    ${clerkId}
                )
                RETURNING *;
            `;
        }));

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}