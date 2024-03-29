import jwt from "jsonwebtoken";
import 'dotenv/config';
export function isAuthenticated(req, res, next) {
	try {
		let token = req.get("authorization");
		if (!token) {
			return res.status(404).json({success: false, msg: "Token not found"});
		}
		token = token.split(" ")[1];
		const decoded = jwt.verify(token,  process.env.ACCEESS_SECRET);
		req.email = decoded.email;
		next();
	} catch (error) {
		return res.status(401).json({success: false, msg: error.message});
	}
}

export function verifyRefresh(email, token) {
	try {
		const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
		return decoded.email === email;
	} catch (error) {
		return false;
	}
}
