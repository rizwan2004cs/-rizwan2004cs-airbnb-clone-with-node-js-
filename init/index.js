const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data")


async function main()
{
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

main()
.then((res)=>{
    console.log("Connected succesfully");
})
.catch(err=>{
    console.log(err);
})


const InitDB =async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Database was intialized with some values");
}

InitDB()