import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

interface ExtendedUser {
  role?: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  provider?: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const useCurrentUser = (): ExtendedUser | null => {
    const { data: session } = useSession();

    return session?.user as ExtendedUser || null;
}