const AppError = require("../utils/AppError");

const handleCastErrorDB=(err)=>{
    const message=`Invalid ${err.path}:${err.value}`
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=(err)=>{
    const value=err.errmsg.match(/"([^"]*)"/);
    const message=`Duplicate field value:${value}. Use another value `;
    return new AppError(message,400);
}
const handleValidationError=(err)=>{
    const error=Object.values(err.errors).map(el=>el.message);
    const message=`Invalid input data. ${error.join(' ')}`;
    return new AppError(message,400);
}
const sendErrorDev=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        stack:err.stack
    });
}
const sendErrorProd=(err,res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,

        });
    }
    else{
        console.error('Error',err);
        res.status(500).json({
            status:'fail',
            message:'Something went wrong'
        });
    }
}

const errorController=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || 'error'
    if(process.env.NODE_ENV==='development'){
        sendErrorDev(err,res);
    }
    else{
        let error={...err};
        if(err.name==='CastError'){
            error=handleCastErrorDB(error);
        }
        if(err.code===11000){
            error=handleDuplicateFieldsDB(error);
        }
        if(err.name==='ValidationError'){
             error=handleValidationError(error);
        }
        sendErrorProd(err,res);
    }
    
}
module.exports=errorController;