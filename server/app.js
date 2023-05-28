const express=require('express');
const tourRouter=require('./routes/tourRoutes')
const userRouter=require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const errorController = require('./controllers/errorController');
const app=express();
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
app.use(express.json({limit:'10kb'}));
app.use(express.static(`${__dirname}/public`)) //serves the static files from the public folder without having a route for it
// app.get('/',(req,res)=>{
//     res.status(200).json({message:'hello world'});
// });

// app.post('/',(req,res)=>{
//     res.send('You can post to this endpoint');
// })
const limiter=rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many requests from this IP,please try again in an hour'
});
app.use('/api',limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(helmet());
app.use(hpp({
    whitelist:['duration']
}));
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.all('*',(req,res,next)=>{
    const err=new AppError(`Can't find ${req.originalUrl} in this server`,400);
    next(err);
    
})
app.use(errorController);
module.exports=app;