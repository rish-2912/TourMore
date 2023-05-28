const dotenv=require('dotenv');
const mongoose=require('mongoose');
process.on('uncaughtException',(err)=>{
    console.log('Uncaught exception');
    console.log(err,'\n',err.message);
    process.exit(1);
});
dotenv.config({path:'./config.env'});
const app=require('./app');
// console.log(app.get('env'));
const DB=process.env.DATABASE;
mongoose.connect(DB).then(()=>{console.log('connected to the database')}).catch(err=>console.log(err));


// console.log(process.env);
const server=app.listen(3000,()=>{
    console.log('server started');
});
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    })
    // process.exit(1);
});
