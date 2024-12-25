import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    const { clerkId } = await request.json()
    
    if (!clerkId) {
        return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
    }

    try {

        const response = await sql`
           SELECT * FROM readios WHERE clerk_id = ${clerkId} AND favorited = true
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}
