export type User = {
    userId: string,
    name: string,
    vote: number | null
}

export type ServerState ={
	users: Record<string,User>,
	hostId: string,
	revealed: boolean
}

export type Message = {
    type: string;
    [key: string]: unknown;
};

export const CustomCodes = {
	TRANSFERRED: 4000,
	HOST_DISCONNECTED: 4001
} as const;