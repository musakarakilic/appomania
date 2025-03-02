import { Header } from "./header";
import BackButton from "@/components/auth/back-button"
import { CardWrapper } from "@/components/auth/card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const ErrorCard = () => {
    return (
        <CardWrapper
            headerLabel="Ooops! Something went wrong!"
            backButtonHref="/auth/login"
            backButtonLabel="Back to Login"
        >
            <div className="w-full flex justify-center items-center">
            <ExclamationTriangleIcon className="text-destructive" />
            </div>
        </CardWrapper>
    )
}
