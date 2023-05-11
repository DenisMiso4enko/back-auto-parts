import jwt from "jsonwebtoken";
import config from "config";

export function isAuthenticated(req, res, next) {
	try {
		let token = req.get("authorization");
		if (!token) {
			return res.status(404).json({success: false, msg: "Token not found"});
		}
		token = token.split(" ")[1];
		const decoded = jwt.verify(token, config.get("accessSecret"));
		req.email = decoded.email;
		next();
	} catch (error) {
		return res.status(401).json({success: false, msg: error.message});
	}
}

export function verifyRefresh(email, token) {
	try {
		const decoded = jwt.verify(token,  config.get("refreshSecret"));
		return decoded.email === email;
	} catch (error) {
		// console.error(error);
		return false;
	}
}
