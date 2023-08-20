const express = require("express");
const bodyParser = require("body-parser");
const { User, connectToDB,Product } = require("./config/mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

//connecting to the Database
connectToDB();

//UserID
let userId = "";
let userImage = "/images/navbar/login.png";

//Multer storage setup

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const storageforProduct = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/products");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadforProducts=multer({storage:storageforProduct});

/*
All routes are handle
*/

//home Route
app.get("/", async (req, res) => {

  let products=await Product.find({});

  let array=products.slice(0,8);

  res.render("index",{data:array});
});
//profileImageupload route
app.get("/profilepicture", (req, res) => {
  res.render("profile_picture");
});
app.post("/profilepicture", upload.single("profileImage"), async (req, res) => {
  let user = await User.findById(userId).exec();

  let profileImagepath=req.file.filename;

  user.profileImage = profileImagepath;
  await user.save();
  res.redirect("/login");
});
//Login Route
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });

  if (user) {
    if ((user.password = req.body.password)) {
      userId = user._id.toHexString();
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/signup");
  }
});
//Signup Route
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post("/signup", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  try {
    if (user === null) {
      let newuser = new User({
        email: req.body.email,
        fullname: req.body.fullname,
        password: req.body.password,
        profileImage: "",
        cart: [],
        orders: [],
      });
      await newuser.save();
      let registereduser = await User.findOne({ email: req.body.email });

      userId = registereduser._id.toHexString();

      res.redirect("/profilepicture");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
});

//cart page route
app.get("/cart",async (req,res)=>{
  if(userId == ""){
    res.render("cart",{isAuthenticated:0})
  }else{
    let user=await User.findById(userId).exec();

    let cart=user.cart;
    
    let products= await Product.find({});
    let newArray=[];

    cart.map((a)=>{
      for(let i=0;i<products.length;i++){
        if(a === products[i]._id.toHexString()){
          newArray.push(products[i]);
        }
      }
    });
    res.render("cart",{isAuthenticated:1,name:user.fullname,data:newArray,image:user.profileImage});
  }
});
//delete cart Item
app.post("/deletecartItem",async(req,res)=>{
  let cartId=req.body.cartId;
  let user= await User.findById(userId).exec();

  let cart=user.cart;

  for(let i=0;i<cart.length;i++){
    if(cartId == cart[i]){
      user.cart.splice(i,1);
      break;
    }
  }

  await user.save();

  res.redirect("/cart");

})
app.post("/additemtoCart",async (req,res)=>{
  if(userId == ""){
    res.redirect("/cart");
  }else{
    let productId=req.body.productId;
    let user=await User.findById(userId).exec();
    user.cart.push(productId);
    await user.save();
    res.redirect("/cart");
  }
})
//shop route
app.get("/shop",async (req,res)=>{

  let products=await Product.find({});

  res.render("allproducts",{data:products});
});
//Single product Route
app.get("/product/:productId",async (req,res)=>{
  let productItemID=req.params.productId;
  let productData=await Product.findById(productItemID).exec();
  res.render("singleproduct",{data:productData,size:productData.availablesize})
})
//add products to the DB managed by owner
app.post("/owner/manage/items",uploadforProducts.single('productimage'),async (req,res)=>{

  let availablesize=req.body.availablesize;

  let sizeArray=availablesize.split(" ");

  const newProduct=new Product({
    productname:req.body.productname,
    price:req.body.price,
    description:req.body.productDescription,
    image:req.file.filename,
    availablesize:sizeArray
  });

  await newProduct.save();

  res.redirect("/owner/manage/items")
})

/*
This Route is created only for
add and remove shop items from DB
This is will be only access to the owner
*/
app.get("/owner/manage/items", (req, res) => {
  res.render("ownermanagement");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("http://localhost:5000");
});
