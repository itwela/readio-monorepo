'use server'

import sql from "./neonClient";

// export async function joinWaitlist(email: string) {
  
//   await sql('INSERT INTO waitlist (email) VALUES ($1)', [email]);

//   console.log("Email added to waitlist: ", email);

// }

export async function joinWaitlist(email: string) {

  // check if email is already in the waitlist
  const existingEmail = await sql`SELECT * FROM waitlist WHERE email = ${email}`;

  if (existingEmail.length > 0) {
    console.log("Email already in waitlist:", email);
    return {
      success: false,
      message: "Already Joined"
    }
  }

  try {
    await sql`INSERT INTO waitlist (email) VALUES (${email})`;
    console.log("Email added to waitlist:", email);
    return {
      success: true,
      message: "Success"
    }
  } catch (error) {
    console.error("Error adding email to waitlist:", error);
    return {
      success: false,
      message: "Error"
    }
  }

  }

export async function getStepCount() {
  const stepsId = 1
  const steps = await sql`SELECT * FROM steps WHERE id = ${stepsId}`;
  return steps;
}