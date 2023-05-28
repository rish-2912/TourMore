const fs=require('fs');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const getTours=async (req,res)=>{
    // res.status(200).json({
    //     status:'success',
    //     results:tours.length,
    //     data:{
    //         tours
    //     }
    // })
    try{
        let qobj={}
        for(let key in req.query){
            if(key==='sort' || key==='page' || key==='limit' || key==='fields'){
                continue;
            }
            if(typeof req.query[key]==='object'){
                let keysOfObject=Object.keys(req.query[key]);
                for(let k of keysOfObject){
                    let nk=`$${k}`
                    qobj={...qobj,[key]:{[nk]:req.query[key][k]}}
                }
            }
            else{
                qobj={...qobj,[key]:req.query[key]}
            }
        }
        // console.log(qobj);
        let query=Tour.find(qobj);
        if(req.query.sort){
            query=query.sort(req.query.sort.replace(',',' '));
        }
        if(req.query.fields){
            query=query.select(req.query.fields.replace(',',' '));
        }
        if(req.query.page){
            const {page,limit}=req.query;
            query=query.skip(+limit*(+page-1)).limit(+limit);
        }
        else{
            query=query.skip(0).limit(8);
        }
        const tours=await query;
        res.status(200).json({
            status:'success',
            results:tours.length,
            data:{
                tours
            }
        })
    }
    catch(err){
        console.log(err);
    }

}

const createTours=catchAsync(async (req,res,next)=>{
    // const newId=tours[tours.length-1].id+1;
    // const newTour={id:newId,...req.body};
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
    //     res.status(201).json({
    //         status:"success",
    //         data:{
    //             tour:newTour
    //         }
    //     })
    // })
    const newTour=await Tour.create(req.body);
    res.status(201).json({
        status:'success',
        data:{
            tour:newTour
        }
    })


})
const getTour=catchAsync(async (req,res,next)=>{
    // const id=+req.params.id
    // const tour=tours.find(ele=>ele.id===id);
    // res.status(200).json({
    //     status:"success",
    //     data:{
    //         tour
    //     }
    // })
    const tour=await Tour.findById(req.params.id);
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
})
const updateTour=catchAsync(async(req,res)=>{
    // res.status(200).json({
    //     status:"success",
    //     data:{
    //         tour:"<Updated tour here>"
    //     }
    // })
    const updatedTour=await Tour.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    res.status(200).json({
        status:"success",
        data:{
            updatedTour
        }
    })
})
const deleteTour=catchAsync(async(req,res)=>{
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:'success',
        data:null
    })
    // res.status(204).json({
    //     status:"success",
    //     data:null
    // })
})
// const validateData=(req,res,next)=>{
//     if(!("name" in req.body) || !("price" in req.body)){
//         return res.status(400).json({
//             status:'failure',
//             message:"Doesn't contain require data"
//         })
//     }
//     next();
// }
const getToursStats=catchAsync(async(req,res)=>{
    const stats=await Tour.aggregate([
        {
            $match:{ratingsAverage:{$gte:4.5}}
        },
        {
            $group:{
                _id:null,
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
            }
        }
    ])
    res.status(200).json({
        status:'success',
        data:{
            stats
        }
    })
})
const busiestMonth=catchAsync(async(req,res)=>{
    const year=req.params.year;
    const reqdata=Tour.aggregate([
        {
        $unwind:'$startDates'
        },
        {
        $match:{startDates:{$gte:new Date(`${year}-01-01`),$lt:new Date(`${year}-12-31}`)}}
        },
        {
        $group:{
            _id:{$month:'$startDates'},
            numOfTours:{$sum:1},
            tours:{$push:'$name'}
        }
        },
        {
        $project:{
            _id:0
        }
        }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            reqdata
        }
    })
})
module.exports={getTours,getTour,createTours,deleteTour,updateTour}