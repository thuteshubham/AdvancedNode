const bcrypt=require('bcrypt')
const saltRound=10

//custom library
let logger=require('./../libs/loggerLib');

let hashPassword=(myPlainTextPassword)=>{
    let salt=bcrypt.genSaltSync(saltRound);
    let hash=bcrypt.hashSync(myPlainTextPassword,salt);
    return hash
}
let comparePassword=(hashPassword,oldPassword,cb)=>{
    bcrypt.compare(oldPassword,hashPassword,(err,res)=>{
        if(err){
            logger.err(err.message,'Comparison error',5);
            cb(err,null)

        }
        else{
            cb(nul,res)

        }
    })
}

module.exports={
    hashPassword:hashPassword,
    comparePassword:comparePassword
}