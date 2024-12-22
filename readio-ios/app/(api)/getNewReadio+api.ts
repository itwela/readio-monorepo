import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    const { clerkId, id } = await request.json()
    
    console.log("clerkId: ", clerkId)
    console.log("SERVER id: ", id)
    if (!clerkId || !id) {
        return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
    }

    try {

        const response = await sql`
           SELECT * FROM readios WHERE clerk_id = ${clerkId} AND id = ${id}
        `;

        return new Response(JSON.stringify({data: response}), {status: 201});
        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}

