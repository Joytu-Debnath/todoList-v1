//jshint esversion:7

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const connect = mongoose.connect("mongodb+srv://joytu:pompa@cluster0.krcd3ov.mongodb.net/TodoList",{
    useNewUrlParser :true
})
// }).then(()=> console.log('Database Connection Successful!'))
// .catch((err) => console.log(err));
const app = express();
let day ='';

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public/css"));

const itemSchema = mongoose.Schema({
    name:{
        type:String,
        required:[1,'Enter list item']
    }
});

const Item = mongoose.model('Item',itemSchema);
const item1 = new Item({
    name:'Write Code'
});

const item2 = new Item({
    name:'Run Code'
});
const item3 = new Item({
    name:'Debug Code'
});

const defaultItems = [item1,item2,item3];
const listSchema ={
    name:String,
    items:[itemSchema]
}
const List = mongoose.model('List',listSchema);

app.get('/',(req,res)=>{
    Item.find({},(err,foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('Successfully saved to database!');
                }
            });
            res.redirect('/');
        }else{
            res.render("list",{listTitle:day,newListItem:foundItems})
        }
    });

    var today = new Date();
    var options = { weekday: 'long', day: 'numeric',
                     month: 'long' }
    day = today.toLocaleDateString("en-US",options);
    console.log(day);
});

app.get('/:random',(req,res)=>{
    const paramName = _.capitalize(req.params.random);
    console.log(paramName);
    // res.render("list",{listTitle:day,newListItem:foundItems})
    List.findOne({name:paramName},(err,result)=>{
        if(!err){
            if(!result){
                console.log("Doesn't exist");
                const list = new List({
                    name:paramName,
                    items:defaultItems
                });
                list.save();
                res.redirect(`/${paramName}`);
            }else{
                console.log('exists');
                res.render("list",{listTitle:result.name,
                    newListItem:result.items});
                // res.redirect('/');
            }
        }
    })

})
app.post('/',function(req,res){
    const taskName = req.body.addText;
    const listname = req.body.list;
    const taskItem = new Item({
        name:taskName
    });
    if(listname === day){
        taskItem.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:listname},function(err,foundList){
            foundList.items.push(taskItem);
            foundList.save();
            res.redirect(`/${listname}`);
        })
    }
});

app.post('/delete',(req,res)=>{
    const checkedItem = req.body.checkbox;
    const listName =req.body.listName;
    if(listName==day){
        Item.findByIdAndRemove(checkedItem,(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log('Item deleted successfully');
                res.redirect('/');
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},
            {$pull:{items:{_id:checkedItem}}},
            (err,foundList)=>{
                if(!err){
                    res.redirect(`/${listName}`)
                }
            })
    }
    
})





app.listen(3000,function(){
    console.log("Server up and running at port 3000");
})