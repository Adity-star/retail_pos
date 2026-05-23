import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { requireUser } from "./require-user";

export async function requireRole(
  allowedRoles: Role[]
) {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}