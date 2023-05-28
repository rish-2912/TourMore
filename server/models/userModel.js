const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name']
    },
    email:{
        type:String,
        required:[true,'Please provide your email'],
        unique:true,
        lowercase:true,
        validate:{
            validator:function(){
                return validator.isEmail(this.email);
            },
            message:'Please provide a valid email'
        },
        // validate:[validator.isEmail(),'Please provide a valid email']
    },
    photo:String,
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minLength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            //this only works for save
            validator:function(el){
                // console.log(el,this.password);
                return this.confirmPassword===this.password;
            },
            message:'Password and confirm Password do not match'
        }
    },
    passwordChangedAt:Date,
    resetToken:String,
    resetExpires:String,
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    changeAfter:{
        type:Date,
        select:false
    },
    remaining:{
        type:Number,
        select:false,
        default:3
    }
});
userSchema.pre('save',async function(next){
    // console.log('ghus gaya');
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
});
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt=Date.now()-1000;
    next();
})
// userSchema.post('find',function(docs,next){
//     console.log('before');
//     console.log(docs);
//     next();
// })
userSchema.pre(/^find/,function(next){
    this.find({active:true});
    next();
})
userSchema.methods.correctPassword=async function(candidatepass,pass){
    return await bcrypt.compare(candidatepass,pass);
}
userSchema.methods.changedPassword=function(tokenTime){
    if(this.passwordChangedAt){
        const changedTime=parseInt(this.passwordChangedAt.getTime()/1000);
        return changedTime>tokenTime;
    }
    return false;   
}
userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.resetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken},this.resetToken);
    this.resetExpires=Date.now()+10*60*1000;
    return resetToken;
}
const User=mongoose.model('User',userSchema);
module.exports=User;