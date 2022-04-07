import { TwitterUser } from "../../classes"

export const users = (): Map<string, TwitterUser> => {
	const users = new Map<string, TwitterUser>()

	users.set("Elon Musk", 			new TwitterUser("Jim Cramer", 					"jimcramer", 					-5))
	users.set("Inverse Jim Cramer", new TwitterUser("Inverse Jim Cramer", 			"CramerTracker", 				10))
	users.set("Elon Musk", 			new TwitterUser("Elon Musk", 					"elonmusk", 					-5))

	return users
}
