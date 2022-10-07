const mongoose = require('mongoose');

const userSchema = new mongoose.Schema( {
    id: {
        type: Number,
        require: true,
        trim: true
    },
    Uid: {
        type: Number,
        unique: true,
        min: 1
      },
    FirstName: {
        type: String,
        //required: true,
        trim: true
      },
    LastName: {
        type: String,
        //required: true,
        trim: true
      },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },
    Mobile: {
        type: Number,
        //required: true,
        unique: true,
        minlength: 10,
        maxlength: 10,
        trim: true
      },
    Password: {
          type: String,
          required: true,
          minlength: 8,
          trim: true
        },
    
    Role: {
          type: String,
          //required: true,
          enum: ["Admin", "Member", "Trainer"],
          trim: true
        },
    Status: {
            type: String,
            //required: true,
            enum: ["Active", "Inactive"],
            trim: true
          }
      }, { timestamps: true });

      const counterSchema = new mongoose.Schema({
        id:{
            type: String
        },
        seq:{
            type: Number
        }
    },{timestamps:true})
    
  const userModel = mongoose.model('User', userSchema)
  const counterModel = mongoose.model('Counter', counterSchema)

module.exports = {userModel, counterModel}

