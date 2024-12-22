import sql from '@/helpers/neonClient'

export async function POST(request: Request) {
    
    try {
        const {id, clerkId, selection} = await request.json()
        console.log("id: ", id)
        console.log("clerkId: ", clerkId)
        console.log("selection: ", selection)

        // if (!id || !clerkId || !selection) {
        //     return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400});
        // }


        let response = {}

        if (selection === true) {
            response = await sql`
                UPDATE readios
                SET favorited = true
                WHERE id = ${id} AND clerk_id = ${clerkId}
                RETURNING *;
            `;
        }

        if (selection === false) {
            response = await sql`
                UPDATE readios
                SET favorited = false
                WHERE id = ${id} AND clerk_id = ${clerkId}
                RETURNING *;
        `;
        }

        console.log("response: ", response)
        
        return new Response(JSON.stringify({data: response}), {status: 201});

        
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({error: error.message}), {status: 500});
    }
}