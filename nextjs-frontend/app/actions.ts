"use server"

// ANCHOR imports
import prisma from "@/lib/db";
import { revalidatePath } from 'next/cache';
import { currentUser } from "@clerk/nextjs/server";


export interface Message {
    role: "user" | "assistant";
    content: string;
  }

// ANCHOR Readio database management (supabase)

export async function addReadioText(text: string) {

  let count = 0;

  const user = await currentUser();
  
  await prisma?.readio.create({
    data: {
      ReadioTitle: "Untitled",
      ReadioText: text,
      userId: user?.id
    }
  })

  count += 1
  revalidatePath('/')

}