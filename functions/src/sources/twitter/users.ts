export const users = (): Map<string, {username: string, modifier: number}> => {
	const users = new Map<string, {username: string, modifier: number}>()

	users.set("Jim Cramer", {username: "jimcramer", modifier: 0})

	return users
}
