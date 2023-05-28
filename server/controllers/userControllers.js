const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const filterObj=(obj,...allowed)=>{
    let ob={}
    for(let key in obj){
        if(allowed.includes(key)){
            ob={...ob,[key]:obj[key]}
        }
    }
    return ob;
}
const getAllUsers=catchAsync(async(req,res,next)=>{
    const users=await User.find();
    res.status(200).json({
        status:'success',
        data:{
            users
        }
    })
})
const createUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })
}
const getUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })
}
const updateMe=catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.confirmPassword){
        return next(new AppError('This route is not for updating password'),400);
    }
    const obj=filterObj(req.body,'name','email');
    // console.log(req.user._id,req.user.id);
    const updatedUser=await User.findByIdAndUpdate(req.user.id,obj,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'success',
        data:{
            updatedUser
        }
    })
})
const deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status.json({
        status:'success',
        data:null
    })
})
const updateUser=(req,res,next)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })
}
const deleteUser=(req,res)=>{
    res.status(500).json({
        status:'error',
        message:'This route is not yet defined'
    })
}

module.exports={getAllUsers,getUser,createUser,updateUser,deleteUser,updateMe,deleteMe}