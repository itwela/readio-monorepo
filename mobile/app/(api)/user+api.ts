import { neon } from '@neondatabase/serverless';


export async function POST(request: Request) {
    
    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const {name, email, clerkId, topics} = await request.json()

        if (!name || !email || !clerkId) {

            return Response.json (
                {error: 'Missing required fields'},
                {status: 400}
            )

        }

        const respone = await sql`
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

        return new Response( JSON.stringify( {data: respone} ), {status: 201} )
        
    } catch (error) {
        console.log(error);
        return Response.json( {error: error}, {status: 400} )
    }
}