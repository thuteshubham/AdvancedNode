const express = require('express');
const shortid = require('short-id');
const mongoose = require('mongoose');
const time = require('./../libs/timeLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('./../libs/paramsValidationLib');
const check = require('./../libs/checkLib');
const token=require('./../libs/tokenLib')
const response = require('./../libs/responseLib');

const UserModel = mongoose.model('User');

let signUpFunction = (req, res) => {
    console.log("signup function called")

    let validateUserInput = () => {
        console.log('validate user Input called')
        return new Promise((resolve, reject) => {
            console.log('Promise called')
            if (req.body.email) {
                console.log('req.body.email in if')
                if (!validateInput.Email(req.body.email)) {
                    console.log('validate input called in if')
                    let apiResponse = response.generate(true, 'Email does not Matches requirements', 400, null);
                    reject(apiResponse)
                }
                else if (check.isEmpty(req.body.password)) {
                    console.log('validate input called in  else if')
                    let apiResponse = response.generate(true, 'password parameter is empty', 400, null)
                    reject(apiResponse)
                }
                else {
                    console.log('validate input called in else')
                    resolve(req)
                }

            }
            else {
                logger.error('Field missing during user creation', 'userController:createUser()', 5)
                let apiResponse = response.generate(true, 'one or more parameters are missing', 400, null)
                reject(apiResponse)

            }
        })
    } //end validate user input
    let createUser = () => {
        console.log('create user called')

        return new Promise((resolve, reject) => {
            console.log('create user promise called')
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                console.log('find one called')
                    if (err) {
                        console.log('find one in if called')
                        logger.error(err.message, 'userController:createUser()', 10);
                        let apiResponse = response.generate(true, 'Failed to create user', 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body);
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err);
                                logger.error(err.message, 'userController:createUser()', 7);
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)

                            }
                            else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })

                    }
                    else {
                        logger.error('user cannot create new user as it is already exist', 'userController:createUser()', 5);
                        apiResponse = response.generate(true, 'user cannot create new user as it is already exist', null);
                    }
                })
        })
    } //end user creation 


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User Created', 200, resolve);
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })

} // End userSignUp Function    




//start login function

let loginFunction = (req, res) => {
    let findUser=()=>{
        console.log("Finding user")
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({email:req.body.email},(err,userDetails)=>{
                    if(err){
                        console.log(err);
                        logger.error('failed to retrive user details','userController:findUser()',5)

                    }
                    else if(check.isEmpty(userDetails)){
                        logger.error('No user Found','userController:findUser()',7)
                        let apiResponse=response.generate(true,'no user found',404,null);

                    }
                    else{
                        logger.info('user Found','userController:findUser()',10);
                        resolve(userDetails)
                    }
                });

            }
            else{
                let apiResponse=response.generate(true,'email parameter missing ',400,null);
                reject(apiResponse)
            }
        });
    } // end findUser function

    let validatePassword=(retrievedUserDetails)=>{
        console.log('validate password');
        return new Promise((resolve,reject)=>{
            passwordLib.comparePassword(req.body.password,retrievedUserDetails.password,(err,isMatch)=>{
                if(err){
                    logger.error(err.message,'userController:validatePassword()',5)
                    let apiResponse=response.generate(true,'error whilr validating password',403,null)
                    reject(apiResponse)

                }
                else if(isMatch){
                    let retrievedUserDetailsObj =retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj._v
                    delete retrievedUserDetailsObj.createdOn 
                    delete retrievedUserDetailsObj.modifiedOn   
                    resolve(retrievedUserDetailsObj)                

                }
                else{
                    logger.error('login failed due to invalid password','userController:validatePassword()',5)
                    let apiResponse=response.generate(true,'invalid Password',403,null);
                    reject(apiResponse)

                }
            })
        })
        
    }// end validatePassword function

    //generate Token
    let generateToken=(userDetails)=>{
        console.log('generate Token');
        return new Promise((resolve,reject)=>{
            token.generateToken(userDetails,(err,tokenDetails)=>{
                if(err){
                    console.log(err)
                    let apiResponse=response.generate(true,'Failed to generate token',500,null);
                    reject(apiResponse)

                }
                else{
                    tokenDetails.userId=userDetails.userId
                    tokenDetails.userDetails=userDetails
                    resolve(tokenDetails)

                }
            })
        })
    }


    findUser(req,res)
    .then(validatePassword)
    .then(generateToken)
    .then((resolve)=>{
        let apiResponse=response.generate(false,'login Successful',200,resolve)
        res.status(200);
        res.send(apiResponse)
    })
    .catch((err)=>{
        console.log("error Handler");
        console.log(err)
        res.status(err.status);
        res.send(err)
    })


} // End loginFunction



let logout = (req, res) => {


} //End Logout

module.exports = {
    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout
}