"use client" // This indicates that the component will only run on the client side.
            // In Next.js, there are also server-side components, this directive enforces client-side usage.

import { useRouter } from "next/navigation" // Importing the useRouter hook from Next.js for navigation.

interface LoginButtonProps {
    children: React.ReactNode, // Child components or content that will be inside this component (React components or HTML elements).
    mode?: "modal" | "redirect", // On user click, a "modal" can be opened or a "redirect" can happen. Default value is "redirect".
    asChild?: boolean // This prop determines whether to use the component as a wrapper. Can be passed optionally.
}

// LoginButton component definition
export const LoginButton = ({
    children,
    mode = "redirect", // If mode prop is not specified, "redirect" is used as default.
    asChild
}: LoginButtonProps) => {
    const router = useRouter() // Using the useRouter hook to access navigation functionality.

    // onClick function redirects to the "/auth/login" page when the user clicks.
    const onClick = () => {
        router.push("/auth/login")
    }

    // If the "mode" prop is set to "modal", a not-yet-implemented modal is returned.
    if (mode === "modal") {
        return (
            <span>
                TODO: Implement Modal {/* Modal implementation should be added here */}
            </span>
        )
    }

    // For "redirect" mode, a <span> that handles the onClick event is returned.
    // This span makes the children inside it (usually a button or text) clickable.
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children} {/* Content (e.g., a button) is placed here */}
        </span>
    )
}
