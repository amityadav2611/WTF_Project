const {userModel, counterModel} = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const { checkData, validRole, validString, validMobileNum, validEmail, validPwd,} = require("../validator/validation")

/////////////////////////////////////////////////create User////////////////////////////////////////////////////////////////////////////////

const createUser= async function(req, res) {    
    try{
        counterModel.findOneAndUpdate(
            {id: "autoval"},
            {$inc:{'seq': 1}},
            {new: true}, async (err, cd) => {
                let seqId;
                if(cd == null){
                    const newVal = new counterModel({id: "autoval",seq: 1})
                    newVal.save()
                    seqId = 1
                }else{
                    seqId = cd.seq
                }



    let data= req.body
    data.Uid = seqId

    if(checkData(data)) return res.status(401).send({status: false, message: "Enter user details"})

    // //Data is Present or not
    if(!data.id) return res.status(401).send({status: false, message: " Please give unique id"}) 
    if(!data.FirstName) return res.status(401).send({status: false, message: "FirstName is required"})
    if(!data.LastName) return res.status(401).send({status: false, message: "LastName is required"})
    if(!data.Email) return res.status(401).send({status: false, message: "Email ID is required"})
    if(!data.Mobile) return res.status(401).send({status: false, message: "Mobile Nimber is required"})
    if(!data.Password) return res.status(401).send({status: false, message: "Password is required"})
    if(!data.Role) return res.status(401).send({status: false, message: "Please type one role"})
    
    
    //validate firstname and lastname
    if(validString(data.FirstName) ||validString(data.LastName) ) return res.status(501).send({status: false, message: "FirstName and LastName should be characters and should not contains any numbers"})

    //validate email
    if(validEmail(data.Email)) return res.status(501).send({status: false, message: "Enter a valid email-id"})

    //validate mobile number
    if(validMobileNum(data.Mobile)) return res.status(501).send({status: false, message: "Enter a 10-digit Indian phone number exluding (+91)"})

    //validate password
    if(validPwd(data.Password)) return res.status(501).send({status: false, message: "Password should be minimum 8 characters long and must contain one of 0-9,A-Z,a-z and special characters"})

    //validate Role
    if(validRole(data.Role)) return res.status(501).send({status: false, message: "Role should be one of Admin, Member or Trainer"})

    //check email and password
    let checkUniqueValues = await userModel.findOne({$or: [{Mobile: data.Mobile}, {Email: data.Email}]})
    if(checkUniqueValues) return res.status(501).send({status: false, message: "E-Mail or phone number already exist"})

    //create password to hash password
    const salt = await bcrypt.genSalt(10)
    data.Password = await bcrypt.hash(data.Password, salt)

    await userModel.create(data, async (err,data)=>{
        if(err){
            await counterModel.findOneAndUpdate({id:"autoval"},{$inc:{'seq':-1}},{new: true})
            return res.status(400).send({msg: err.message})
        }
        if(data){
            return res.status(200).send({Status: true, message: "Account successfully created", data})
        }
    })
}
)

}
catch(err){
res.status(501).send({msg: err.message})
}
}

/////////////////////////////////////////////////////////Login User///////////////////////////////////////////////////////////////////////////

const loginUser = async (req, res) => {
    try{
        let data = req.body;
        const {Email, Password, Role} = data

        //check data is present or not
        if(Object.keys(data).length == 0) return res.status(401).send({status: false, message: "Email and Password is required for login"})

        //check email or password is present in body or not
        if(!data.Email) return res.status(401).send({status: false, message: "Email field is empty"})
        if(!data.Role) return res.status(401).send({status: false, message: "Role field is empty"})
        if(!data.Password) return res.status(401).send({status: false, message: "Password field is empty"})


        //validate email
        if(validEmail(data.Email)) return res.status(401).send({status: false, message: "Enter a valid email-id"})

        //validate password
        if(validPwd(data.Password)) return res.status(401).send({status: false, message: "Enter a valid password"})

        //check email is corrrect or not
        let getEmailData = await userModel.findOne({Email: data.Email, Role: data.Role})
        if(!getEmailData) return res.status(401).send({status: false, message: "Email or Role is incorrect"})

        //check password is correct or not
        let passwordData = await bcrypt.compare(Password, getEmailData.Password)
        if(!passwordData) return res.status(401).send({status: false, message: "Password is incorrect"})

        //generate token
        let token = jwt.sign({ userId: getEmailData._id }, "WTF-Project", {expiresIn: '30d'});

        //assign the userdId in a variable
        let userData = getEmailData._doc

        //set the headers
        res.status(200).setHeader("x-api-key", token);

        res.status(200).send({status: true, message: "Logged in successfully", data: {userDetails: userData, token: token, Uid:userData.Uid, Email: userData.Email}})
        
    }catch(err){
        res.status(501).send({status: false, Error: err.message})
    }
}

////////////////////////////////////////////////////////////GetAllUser/////////////////////////////////////////////

const getAll = async function (req, res) {

    try {
        let data = req.query

        let userDetails = await userModel.find(data)
        if(userDetails.length == 0) return res.status(401).send({status: false, message: "No Users found"})
        return res.status(200).send({status: true,  message: "success", data: userDetails})
    }
    catch (error) {
        res.status(501).send({ status: false, message: error.message, });
    }

}

/////////////////////////////////////////////////////////GetUserByFilter///////////////////////////////////////////

const getFilterUser = async (req, res) => {
    try {
      let data = req.query;
  
      let getFilter = await userModel.find(data).select({FirstName: 1,LastName: 1,Email: 1,Mobile: 1,Status: 1,Role: 1});
  
      if (getFilter.length == 0) return res.status(401).send({status: false,message: "No user found"});
  
      res.status(200).send({status: true,message: "Details Found",data: getFilter});
  
    } catch (err) {
      return res.status(501).send({status: false,Error: err.message})
    }
   }


module.exports = { createUser, loginUser, getAll, getFilterUser}