import sql from "@/helpers/neonClient";

export async function POST(request: Request) {
    const { clerkId, topic } = await request.json()
    
    if (!clerkId) {
        return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
    }

    try {

        let response = {}

        if (topic.length > 0) {
            response = await sql`
               SELECT * FROM readios WHERE topic = ${topic}
               `;
        }
            
        if (topic.length === 0) {
            response = await sql`
                SELECT * FROM readios WHERE clerk_id = ${clerkId}
            `;
        }
        
        return new Response(JSON.stringify({data: response}), {status: 201});

        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }

}

// export async function POST(request: Request, {id}: { id: string }) {
    
//     console.log("request: ", request);

//     const { clerkId } = await request.json()

//     if (!clerkId) {
//         return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
//     }

//     try {
//         const sql = neon(`${process.env.DATABASE_URL}`);

//         const response = await sql`
//            SELECT * FROM playlists WHERE clerk_id = ${clerkId}
//         `;

//         return new Response(JSON.stringify({data: response}), {status: 201});
        
//     } catch (error: any) {
//         console.error(error);
//         return new Response(JSON.stringify({error: error.message}), {status: 500});
//     }
// }