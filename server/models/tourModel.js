const mongoose=require('mongoose');
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true
    },
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have a difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Values can only be easy,medium,difficult'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                //this keyword only points to the document only on creation and not updation
                return val<this.price
            },
            message:'Discount price {VALUE} is more than price'           
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a description']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})
//works only for create and save document
tourSchema.pre('save',function(next){
    console.log(this);//access to the current doucment
    next();
});
tourSchema.pre('save',function(next){
    console.log(this);//access to the current doucment
    next();
});
tourSchema.post('save',function(next){
    console.log(this);
    next();
});
tourSchema.pre(/^find/,function(next){
    // console.log('before pre');
    // this keyword here points to the query object
    next();
});
tourSchema.post('find',function(docs,next){
    // console.log('before');
    // console.log(docs);
    next();
});
tourSchema.pre('aggregate',function(next){
    console.log(this.pipeline);
    next();
});
const Tour=mongoose.model('Tour',tourSchema);
module.exports=Tour;