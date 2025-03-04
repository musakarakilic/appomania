import { ExtendedUser } from "@/types/next-auth";
import { useUserQuery } from "@/hooks/use-user-query";

interface UserInfoProps {
    label: string;
    user: any; // tip tanımını projenize göre güncelleyin
}

export const UserInfo = ({ label }: { label: string }) => {
    const { settings, isLoading } = useUserQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
            <h3 className="font-medium mb-4">{label}</h3>
            <pre className="text-sm bg-slate-100 p-4 rounded-lg">
                {JSON.stringify(settings, null, 2)}
            </pre>
        </div>
    );
};

const InfoItem = ({
    label,
    value
}: {
    label: string
    value?: string
}) => {
    return (
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-slate-500">
                {label}
            </p>
            <p className="text-sm font-mono bg-slate-50 p-2 rounded-lg break-all">
                {value}
            </p>
        </div>
    )
}