import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    
    try {
        const {name, email, clerkId, topics} = await request.json()

        if (!name || !email || !clerkId) {
            return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        }

        const response = await sql`
            INSERT INTO users (
                name,
                email,
                clerk_id,
                topics
            )
            VALUES (
                ${name},
                ${email},
                ${clerkId},
                ${topics}
            )
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}