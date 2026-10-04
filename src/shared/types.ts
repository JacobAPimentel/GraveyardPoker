export type User = {
    id: string,
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