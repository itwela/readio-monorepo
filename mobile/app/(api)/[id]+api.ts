import { neon } from '@neondatabase/serverless';

export async function GET(request: Request, {id}: { id: string }) {
    const message = "Hi";
    console.log(message);
    return Response.json({ data: message }, { status: 200 });
}

// export async function GET(request: Request, {id}: { id: string }) {
    
//     console.log("id: ", id)

//     if (!id) {
//         return new Response(JSON.stringify({error: 'Missing required fields'}), {status: 400, headers: {'Content-Type': 'application/json'}});
//     }

//     try {
//         const sql = neon(`${process.env.DATABASE_URL}`);
//         const response = await sql`
//             SELECT * FROM readios
//         `;
//         return new Response(JSON.stringify(response), {status: 200, headers: {'Content-Type': 'application/json'}});
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return new Response(JSON.stringify({ error: 'Internal Server Error' }), {status: 500, headers: {'Content-Type': 'application/json'}});
//     }
// }