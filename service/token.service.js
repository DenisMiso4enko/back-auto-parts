import jwt from "jsonwebtoken";
import { TokenModel } from "../models/Token.js";
import 'dotenv/config';

class TokenService {
  generate(payload) {
    const accessToken = jwt.sign(payload,  process.env.ACCEESS_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET);
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  async save(userId, refreshToken) {
    const data = await TokenModel.findOne({ user: userId });
    if (data) {
      data.refreshToken = refreshToken;
      return data.save();
    }

    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }

  validateRefresh(refreshToken) {
    try {
      return jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  }

  validateAccess(accessToken) {
    try {
      return jwt.verify(accessToken,  process.env.ACCEESS_SECRET);
    } catch (e) {
      return null;
    }
  }

  async findToken(refreshToken) {
    try {
      return await TokenModel.findOne({ refreshToken });
    } catch (e) {
      return null;
    }
  }
}

export const tokenService = new TokenService();
