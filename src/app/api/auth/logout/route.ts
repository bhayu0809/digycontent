import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function GET() {
  await deleteSession();
  redirect("/login");
}
