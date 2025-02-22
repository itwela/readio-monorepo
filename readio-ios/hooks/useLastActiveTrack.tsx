import { createContext, useContext, useEffect, useState } from "react"
import { Track, useActiveTrack } from "react-native-track-player"

type LastActiveTrackContextType = {
    lastActiveTrack: Track | undefined
    clearLastActiveTrack: () => void
}

const LastActiveTrackContext = createContext<LastActiveTrackContextType | any>(undefined)

export const LastActiveTrackProvider = ({ children }: { children: React.ReactNode }) => {
    const activeTrack = useActiveTrack()
    const [lastActiveTrack, setLastActiveTrack] = useState<Track>()

    useEffect(() => {
        if (!activeTrack) return
        setLastActiveTrack(activeTrack)
    }, [activeTrack])

     const clearLastActiveTrack = () => {
        setLastActiveTrack(undefined)
    }

    return (
        <LastActiveTrackContext.Provider value={{ lastActiveTrack, clearLastActiveTrack }}>
            {children}
        </LastActiveTrackContext.Provider>
    )
}

export const useLastActiveTrack = () => {
    const context = useContext(LastActiveTrackContext)
    if (!context) {
        throw new Error("useLastActiveTrack must be used within a LastActiveTrackProvider")
    }
    return context
}