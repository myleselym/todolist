//jshint esversion:6
const express = require("express");
const app = express();
const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();
srvCreds = process.env.MONGO_ATLAS_USERNAME;
srvPassword = process.env.MONGO_ATLAS_PASSWORD;
mongoose.connect('mongodb+srv://' + srvCreds + ':' + srvPassword + '@cluster0.qumyt5a.mongodb.net/todolistDB', { useNewUrlParser: true });

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name : {type: String},
});

const Item = mongoose.model('Item', itemsSchema);


const item1 = new Item ({
  name : "Welcome to your todo list"
})

const item2 = new Item ({
  name : "Hit the + button to add new item."
})

const item3 = new Item ({
  name : "<-- Click here to delete item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {
  newListItems = Item.find({}, function(err, items) {
    if (items.length === 0) {
      hasStarted = true;
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.error(err);
        }else {
          console.log("Successfully added default items to DB.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save()
    res.redirect('/');
  }else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const id = req.body.checkbox
  const listName = req.body.listName
  if (listName === "Today"){
    Item.deleteOne({ _id : id }, function(err, item) {
      if (!err){
        console.log("successfully deleted.");
        res.redirect("/");
      }
      else{
        console.log(err.message)
      }
    });
  }else{
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.pull({_id: id});
      foundList.save();
      res.redirect('/' + listName);
    });
  }  
});
  
app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      }else{
      res.render("list", {listTitle: customListName, newListItems: foundList.items});
      } 
    }
  });
  
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
