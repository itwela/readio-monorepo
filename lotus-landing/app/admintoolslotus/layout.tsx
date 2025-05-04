import React from "react"
export default function adminToolsPageServer({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="no-scrollbar">
            {children}
        </div>
    )
}