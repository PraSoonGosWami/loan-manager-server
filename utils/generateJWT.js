const jwt = require("jsonwebtoken");

/**
 *
 * @param  user : MongoUser
 * @returns signed JWT Token
 */
const generateJWT = (user) => {
  try {
    return {
      token: jwt.sign(
        { id: user._id, email: user.email },
        process.env.private_key
      ),
      error: null,
    };
  } catch (error) {
    console.log(error);
    return { token: null, error };
  }
};

module.exports = generateJWT;
