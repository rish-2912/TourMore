const express=require('express');
const {getTours,getTour,createTours,updateTour,deleteTour}=require('../controllers/tourControllers');
const { protect, restrictTo } = require('../controllers/authenticationController');

const router=express.Router()
router.param('id',(req,res,next,val)=>{
    // console.log(val)
    next();
})
router.route('/').get(protect,getTours).post(createTours)
router.route('/:id').get(getTour).patch(updateTour).delete(protect,restrictTo('admin'),deleteTour);

module.exports=router 