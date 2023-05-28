const mongoose=require('mongoose');
const dotenv=require('dotenv');
const fs=require('fs');
const Tour = require('../../models/tourModel');
dotenv.config({path:'config.env'});
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log('database connected');
});
const data=JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'));
const importData=async()=>{
    try{
        await Tour.create(data);
    }
    catch(err){
        console.log(err);
    }
}
const deleteData=async()=>{
    try{
        await Tour.deleteMany();
    }
    catch(err){
        console.log(err);
    }
}
if(process.argv[2]=='--import'){
    importData();
}
else if(process.argv[2]=='--delete'){
    deleteData();
}