"use client"

import { FaUser } from "react-icons/fa"
import { ExitIcon } from "@radix-ui/react-icons"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar"

import { useCurrentUser } from "@/hooks/use-current-user"
import { LogoutButton } from "@/components/auth/logout-button"

interface UserButtonProps {
    showLogout?: boolean;
}

export const UserButton = ({
    showLogout = true
}: UserButtonProps) => {
    const user = useCurrentUser()

    if (!showLogout) {
        return (
            <Avatar>
                <AvatarImage src={user?.image || ""}/>
                <AvatarFallback className="bg-[radial-gradient(ellipse_at_top,__var(--tw-gradient-stops))]
from-[#212cff] to-[#cbe0de]">
                    <FaUser className="text-white" />
                </AvatarFallback>
            </Avatar>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user?.image || ""}/>
                    <AvatarFallback className="bg-[radial-gradient(ellipse_at_top,__var(--tw-gradient-stops))]
from-[#212cff] to-[#cbe0de]">
                        <FaUser className="text-white" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
                <LogoutButton>
                    <DropdownMenuItem>
                        <ExitIcon className="h-4 m-4 mr-2"/>
                        Logout
                    </DropdownMenuItem>
                </LogoutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}