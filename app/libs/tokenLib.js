const jwt = require('jsonwebtoken');
const time = require('./timeLib')
const shortid = require('short-id');
const secreteKey = 'someVeryRandomKeyThatNobodyCanGuess';

let generateToken = (data, cb) => {
    try {
        let claims = {
            jwtid: shortid.generate(),
            iat: time.now(),
            exp: Math.floor(time.now() / 1000) + (60 * 60 * 24),
            sub: 'authToken',
            iss: 'edChat',
            data: data
        }
        let tokenDetails = {
            token: jwt.sign(claims, secreteKey)
        }
        cb(null, tokenDetails);
    }

    catch (err) {
        console.log(err);
        cb(err, null)
    }

}//end generate Token

let verifyClaim = (token, cb) => {
    jwt.verify(token, secreteKey, function (err, decoded) {
        if (err) {
            console.log("Error while verifying token");
            console.log(err);
            cb(err, null)
        }
        else {
            console.log("user verified");
            console.log(decoded);
            cb(null, decoded)
        }
    });
}// end verify claim

module.exports = {
    generateToken: generateToken,
    verifyClaim: verifyClaim
}