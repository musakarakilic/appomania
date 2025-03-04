import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export const useCurrentRole = () => {
    const { data: session } = useSession();

    return session?.user?.role;
}