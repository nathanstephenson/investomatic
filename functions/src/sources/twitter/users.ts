import { TwitterUser } from "../../classes"

export const users = (): Map<string, TwitterUser> => {
	const users = new Map<string, TwitterUser>()

	users.set("Elon Musk", 			new TwitterUser("Jim Cramer", 					"jimcramer", 					-5))
	users.set("Inverse Jim Cramer", new TwitterUser("Inverse Jim Cramer", 			"CramerTracker", 				10))
	users.set("Elon Musk", 			new TwitterUser("Elon Musk", 					"elonmusk", 					-5))
	users.set("Unusual Whales", 	new TwitterUser("Unusual Whales", 				"unusual_whales", 				10))

	return users
}
