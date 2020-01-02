const jwt = require('jsonwebtoken');

module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    let result;
    if (authorizationHeader) {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const options = {
            expiresIn: process.env.JWT_EXPIRES, issuer: process.env.JWT_ISSUER 
        };
        try {
            // verify makes sure that the token hasn't expired and has been issued by us
            result = jwt.verify(token, process.env.JWT_SECRET, options);

            // Let's pass back the decoded token to the request object
            req.decoded = result;
            // We call next to pass execution to the subsequent middleware
            next();
        } catch (err) {
  			result = { 
	        	error: `Authentication error. In-valid Token.`,
	        	status: 401
	      	};
	      	console.log(result);
	      	res.status(401).send(result);
            // Throw an error just in case anything goes wrong with verification
            //throw new Error(err);
        }
    } else {
      result = { 
        error: `Authentication error. Token required.`,
        status: 401
      };
      console.log(result);
      res.status(401).send(result);
    }
  }
};