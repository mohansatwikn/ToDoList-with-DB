const bodyParser = require("body-parser");
const _=require("lodash");

const express=require("express");
const app=express();

const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/todolistDB');
const itemsschema=new mongoose.Schema({
    name:String
})
const Item=mongoose.model("Item",itemsschema);
const item1=new Item({
    name:"Hey,here are the things to do today"
})

const item2=new Item({
    name:"click the + button to add"
})

const item3=new Item({
    name:"<-check the box here to delete"
})

const defaultItems=[item1,item2,item3];
// Item.insertMany(defaultItems);

const listschema=new mongoose.Schema({
    name:String,
    items:[itemsschema]
});

const List=mongoose.model("List",listschema);

const port=3000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine','ejs');


app.get("/",async (req,res)=>{
    const data=await Item.find({});
    if(data.length===0){
        Item.insertMany(defaultItems);
        res.redirect("/");
    }
    else res.render("list",{listTitle:"Today",newitemlist:data});
    // await list();rs

});

app.post("/",async(req,res)=>{
    const customname=req.body.newitem;
    const customlist=req.body.listname;
    const obj=new Item({
        name:customname
    });
    if(customlist==="Today"){
        obj.save();
        res.redirect("/");
    }
    else{
        const addtolist=await List.findOne({name:customlist});
        // console.log(addtolist);
        addtolist.items.push(obj);
        addtolist.save();
        res.redirect("/"+customlist);
    }
});

app.get("/:customlistname",async (req,res)=>{
    const customlistname=_.capitalize(req.params.customlistname);
    if(customlistname==="favicon.ico")res.redirect("/");
    else {
        const foundlist=await List.findOne({name:customlistname});
        if(!foundlist){
            const list=new List({
                name:customlistname,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customlistname);
        }
        else {
            res.render("list",{listTitle:customlistname,newitemlist:foundlist.items});
        }
    }
});

app.post("/delete",async (req,res)=>{
    const delid=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        await Item.findByIdAndDelete(delid);
        // console.log(delid);
        res.redirect("/");
    }else {
        await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:delid}}});
        res.redirect("/"+listName);          
    }
})

app.post("/:customname",(req,res)=>{
    const customname=req.params.customname;
    let item=req.body.newitem;
    const obj=new Item({
        name:item
    });
    obj.save();
    res.redirect("/"+customname);
});

app.listen(port,()=>{
    console.log(`server listening in port ${port}`);
});