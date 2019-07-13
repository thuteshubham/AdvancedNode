let Email=(email)=>{
    let emailRegex=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if(email.match(emailRegex)){
        return true;
    }
    else{
        return false;
    }
}

let Password=(password)=>{
    let passwordRegex=/^[A-Za-z0-9]\w{7,}$/
    if(password.match(passwordRegex)){
        return true;
    }
    else{
        return false;
    }
}

module.exports={
    Email:Email,
    Password:Password
}