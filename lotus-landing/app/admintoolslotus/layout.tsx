import React from "react"
export default function adminToolsPageServer({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className="no-scrollbar">
            {children}
        </div>
    )
}