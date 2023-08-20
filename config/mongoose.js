const mongoose=require('mongoose');
require('dotenv').config();

const connectToDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
    }catch(error){
        console.log(error);
    }
}

const userSchema=new mongoose.Schema({
    fullname:String,
    email:String,
    password:String,
    profileImage:String,
    cart:[String],
    orders:[{
        productId:String,
        quantity:String,
        Size:String
    }]
});

const User=mongoose.model("User",userSchema);

const productSchema = new mongoose.Schema({
    productname:String,
    description:String,
    price:String,
    availablesize:[String],
    image:String
});

const Product=mongoose.model("Product",productSchema);


module.exports={
    connectToDB:connectToDB,
    User:User,
    Product:Product
}