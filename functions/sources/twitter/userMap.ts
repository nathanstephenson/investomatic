function getUsers(): Object{
	const users = new Object()
	users["Jim Cramer"] = {username: "jimcramer", modifier: 0}

	return users;
}

module.exports = {
	userMap: getUsers()
}