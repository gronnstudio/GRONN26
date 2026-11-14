"use server"

import { del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"

export async function verwijderMedia(url: string) {
  await eisEigenaar()
  if (!new URL(url).pathname.startsWith("/media/")) throw new Error("Ongeldig bestand")
  await del(url)
  revalidatePath("/dashboard/media")
}
