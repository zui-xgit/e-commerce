import { ReactNode } from "react";

const DashboardInnerLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {children}
        </div>
    );
};

export default DashboardInnerLayout;
