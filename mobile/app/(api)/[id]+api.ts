import sql from "@/helpers/neonClient";

export async function GET(request: Request, { id }: { id: string }) {
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      // Join stations with station_clerks to get station details based on clerk_id
      const stations = await sql`
        SELECT stations.*
        FROM stations
        INNER JOIN station_clerks ON stations.id = station_clerks.station_id
        WHERE station_clerks.clerk_id = ${id};
      `;
      
      return new Response(JSON.stringify({ data: stations }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }