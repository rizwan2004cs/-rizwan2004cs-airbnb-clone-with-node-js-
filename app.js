const express = require("express");
let app = express();
let mongoose = require("mongoose");
let path = require("path");
let Listing = require("./models/listing.js");
// let Data = ("../init/data.js");
var methodOverride = require("method-override");
let ejsMate = require("ejs-mate");

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

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

app.get("/", (req, res) => {
  res.send("Hi i'm root");
});

app.get("/listings", async (req, res) => {
  let lists = await Listing.find({});
  res.render("listing/index.ejs", { lists: lists });
});

app.get("/listings/new", (req, res) => {
  res.render("listing/new");
});

app.get("/listings/:id", async (req, res) => {
  const { id } = req.params; // Use req.params.id directly
  const list = await Listing.findById(`${id}`); // Use a consistent name, e.g., list

  res.render("listing/show", { list: list }); // Pass list as the key to the template
});

app.post("/listings", async (req, res) => {
  //   res.send("Post request requested");
  let { title, description, image, price, country, location } = req.body;
  let newListing = Listing(req.body);
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
});

app.get("/listings/:id/edit", async (req, res) => {
  const id = req.params.id;
  let listing = await Listing.findById(id);
  console.log(id);
  res.render("listing/edit.ejs", { listing: listing });
});

app.put("/listings/:id", async (req, res) => {
  const id = req.params.id;
  let listing = await Listing.findByIdAndUpdate(id, req.body);
  res.redirect(`/listings/${id}`);
});

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
