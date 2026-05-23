import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      email: authUser.email!,
    },
    include: {
      tenant: true,
    },
  });

  return user;
}