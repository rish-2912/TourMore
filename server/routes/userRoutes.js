const express=require('express')
const router=express.Router()
const {getAllUsers,createUser,getUser,updateUser,deleteUser, updateMe, deleteMe}=require('../controllers/userControllers')
const { signUp, login, protect, restrictTo, forgotPassword, resetPassword, updatePassword } = require('../controllers/authenticationController')

router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgotPassword').patch(forgotPassword);
router.route('/resetPassword/:token').post(resetPassword);
router.route('/updatePassword').post(protect,updatePassword);
router.route('/updateMe').patch(protect,updateMe);
router.route('/deleteMe').delete(protect,deleteMe);
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(protect,restrictTo('admin'),deleteUser)

module.exports=router