import { create } from 'zustand'

type QueueStore = {
	activeQueueId: string | null
	setActiveQueueId: (id: string) => void
}

export const useQueueStore = create<QueueStore>()((set: any) => ({
	activeQueueId: null,
	setActiveQueueId: (id: any) => set({ activeQueueId: id }),
}))

export const useQueue = () => useQueueStore((state: any) => state)