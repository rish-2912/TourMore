const {promisify}=require('util');
const crypto=require('crypto');
const jwt=require('jsonwebtoken');
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError');
const sendMail = require('../utils/email');
const signToken=id=>jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES});
const createSendToken=(res,statusCode,user)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date(Date.now()+90*24*60*60*1000),
        httpOnly:true,
        // secure:true
    }
    res.cookie('jwt',token,cookieOptions);
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}
const signUp=catchAsync(async(req,res,next)=>{
    let newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
    });
    newUser=await User.findById(newUser.id);
    createSendToken(res,201,newUser);
});
const login=catchAsync(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new AppError('Please enter email and password'),400);
    }
    let user=await User.findOne({email}).select('+password').select('+remaining').select('+changeAfter').select('changedTime');
    // console.log(user);
    if(!user){
        return next(new AppError('Email does not exist',401));
    }
    if(!(await user.correctPassword(password,user.password))){
        let remaining=user.remaining;
        const changedTime=user.time;
        if(remaining===0){
            if(user.changeAfter<Date.now()){
                user=await User.findByIdAndUpdate(user.id,{remaining:3},{new:true,runValidators:false});
                remaining=3;
            }
            else{
                return next(new AppError('Limit reached. Try again after sometime'),429);
            }
        }
        await User.findByIdAndUpdate(user.id,{remaining:remaining-1},{new:true,runValidators:false});
        remaining-=1;
        if(remaining===0){
            await User.findByIdAndUpdate(user.id,{changeAfter:Date.now()+10*1000},{new:true,runValidators:false});
            return next(new AppError('Limit reached. Try again after sometime'),400);
        }
        return next(new AppError(`Incorrect Password.${remaining} attempts left`));
    }
    // console.log(user[0]._id);
    await User.findByIdAndUpdate(user.id,{remaining:3,changeAfter:undefined},{new:true,runValidators:false});
    createSendToken(res,200,user);

});
const protect=catchAsync(async(req,res,next)=>{
    // console.log('protect');
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('You are not logged in',401));
    }
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    // console.log(decoded);
    const freshUser=await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user no longer exists',401));
    }
    if(freshUser.changedPassword(decoded.iat)){
        return next(new AppError('User changed password recently!Please Login again'));
    }
    req.user=freshUser;
    next();
});
const restrictTo=(...roles)=>{
    return (req,res,next)=>{
        // console.log('restrict to')
        // console.log(req.user.role,roles);
        if(!(roles.includes(req.user.role))){
            // console.log('yes');
            return next(new AppError('You are not authorized to perform this operation'),403);
        }
        next();
    }
}
const resetPassword=catchAsync(async(req,res,next)=>{
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({resetToken:hashedToken,resetExpires:{$gt:Date.now()}});
    if(!user){
        return next(new AppError('Token is invalid'),400);
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.resetToken=undefined;
    user.resetExpires=undefined;
    await user.save();
    createSendToken(res,200,user);
})
const forgotPassword=catchAsync(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('Email does not exist',404));
    }
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message=`Change your password using this link ${resetURL}`;
    await sendMail({
        email:user.email,
        subject:'Your password reset token (valid for 10min)',
        message
    });
    res.status(200).json({
        status:'success',
        message:'Token sent to mail'
    })
});
const updatePassword=catchAsync(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select('+password');
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError('Your current password does not match'),401);
    }
    user.password=req.body.password;
    user.confirmPassword=req.body.confirmPassword;
    await user.save();
    createSendToken(res,200,user);
})
module.exports={signUp,login,protect,restrictTo,resetPassword,forgotPassword,updatePassword};

