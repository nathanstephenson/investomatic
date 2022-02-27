export const users = (): Map<string, {name: string, username: string, modifier: number}> => {
	const users = new Map<string, {name: string, username: string, modifier: number}>()

	users.set("Jim Cramer", 		{ name: "Jim Cramer", 			username: "jimcramer", 		modifier: -5 })
	users.set("Inverse Jim Cramer", { name: "Inverse Jim Cramer", 	username: "CramerTracker", 	modifier: 10 })
	users.set("Elon Musk", 			{ name: "Elon Musk", 			username: "elonmusk", 		modifier: -5 })

	return users
}
