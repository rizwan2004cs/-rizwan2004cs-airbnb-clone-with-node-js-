const express = require("express");
let app = express();
let mongoose = require("mongoose");
let path = require("path");
let Listing = require("./models/listing.js");
let Review = require("./models/review.js");
// let Data = ("../init/data.js");
var methodOverride = require("method-override");
let ejsMate = require("ejs-mate");
let asyncWrap = require("./utils/AsyncWrap.js") ;
let ExpressError = require("./utils/ExpressError.js") ;
let ListingSchema = require("./Schema.js");

// let ExpressError = require("./ExpressError.js");

async function main() {
  await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

main()
  .then((res) => {
    console.log("Connected succesfully");
  })
  .catch((err) => {
    console.log(err);
  });

const ValidateError  = (req,res,next)=>{
  
  let {error} = ListingSchema.validate(req.body);
  if(error)
  {
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }
    
  else next();
}

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.listen(4900, () => {
  console.log("server is running on port 3001");
});

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"Raj fort",
//         description:"This is a independent villa",
//         image:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         price:5000,
//         location:"Calicut",
//         country:"India"
//     });
//     await sampleListing.save();
//     res.send("listing saved");
//     console.log(sampleListing);
// })




app.get("/listings", asyncWrap(async (req, res,next) => {
  let lists = await Listing.find({});
  console.log(lists);
  if(lists.length === 0)
     {
      next(new ExpressError(404,"Data is not found"));
     }
  
  res.render("listing/index.ejs", { lists: lists });
}));

app.get("/listings/new", (req, res) => {
  res.render("listing/new");
});

app.get("/listings/:id", asyncWrap(async (req, res,next ) => {

  const { id } = req.params; // Use req.params.id directly
  const list = await Listing.findById(`${id}`); // Use a consistent name, e.g., list
  if(!list)
     {
      next(new ExpressError(404,"Data is not found"));
     }

  res.render("listing/show", { list: list }); // Pass list as the key to the template

}));

app.post("/listings",ValidateError, asyncWrap(async (req, res) => {
  //   res.send("Post request requested");
  let { title, description, image, price, country, location } = req.body;
  // let result = ListingSchema.validate(req.body);
  // console.log(result);
  // if(result.error)
  // {
  //   throw new ExpressError(400,result.error)
  // }
  if(!req.body)
    throw new ExpressError(400,"Enter valid data")
  let newListing = Listing(req.body);

  // if(!newListing.title)
  // {
  //   throw new ExpressError(400,"Title must be provided")
  // }
  // if(!newListing.description)
  //   {
  //     throw new ExpressError(400,"description must be provided")
  //   }
  //   if(!newListing.price)
  //     {
  //       throw new ExpressError(400,"price must be provided")
  //     }
  //     if(!newListing.country)
  //       {
  //         throw new ExpressError(400,"country must be provided")
  //       }
  await newListing
    .save()
    .then((res) => {
      console.log("Saved Successfully");
    })
    .catch((err) => {
      console.log(err);
    });
  //   res.send(req.body);
  console.log(req.body);
  res.redirect("/listings");
}));

app.get("/listings/:id/edit", asyncWrap(async (req, res) => {
  const id = req.params.id;
  let listing = await Listing.findById(id);
  console.log(id);
  res.render("listing/edit.ejs", { listing: listing });
}));

app.put("/listings/:id", asyncWrap(async (req, res) => {
 
  const id = req.params.id;
  let listing = await Listing.findByIdAndUpdate(id, req.body);
  if(!req.body)
    throw new ExpressError(400,"Enter valid data")
  res.redirect(`/listings/${id}`);
 
}));

app.delete("/listings/:id", async (req, res) => {
  const id = req.params.id;
  let delList = await Listing.findByIdAndDelete(id)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log("deleted " + delList);
  res.redirect("/listings");
});

app.post("/listings/:id/reviews", async (req, res) => {
  const id = req.params.id;
  // let {review} = req.body;
  let listing = await Listing.findById(id);
  console.log("New review item"+listing);
  
  let newReview =  new Review(req.body.review);
  console.log(newReview);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.send(`Review page undergoing for ${id}`)

});

const handleValidationError = function(err){
  console.log("This is validation error");
  console.dir(err);
  return err;
}

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not found"))
})

app.use((err,req,res,next)=>{
  if(err.name == "ValidationError"){
    err = handleValidationError(err);
  }
  next(err);
})

app.use((err,req,res,next)=>{
  let {status=500,message="This is an valid error"} =err;
  res.status(status).render("listing/error.ejs",{message});
})
