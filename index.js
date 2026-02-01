 import express from 'express';
import {MongoClient} from 'mongodb';
import {ObjectId} from 'mongodb';

const dbName = "school";
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');
client.connect().then((connection)=>{
    const db = connection.db(dbName);
    app.get('/api',async (req,resp)=>{
        const collection = db.collection('students');
        const students = await collection.find({}).toArray();
        resp.send(students);
    });
    // render data in ui
    app.get('/ui', async (req, resp)=>{
        const collection = db.collection('students');
        const students = await collection.find().toArray();
        resp.render('students',{students})
    })
    // form to add data
    app.get("/add", (req, resp)=>{
        resp.render('form');
    })
    // add data through form
     app.post('/students', async (req, resp)=>{
        const collection = db.collection('students');
        const result = await collection.insertOne(req.body);
        console.log(result);
        resp.send("Data received");
    })
    //add data through api
    app.post('/add-student-api', async (req, resp)=>{
        console.log(req.body);
        const {name, age, email, college} = req.body;
        if(!name || !age || !email || !college){
            resp.send({message:"operation failed", success: false});
            return false;
        }
        const collection = db.collection('students');
        const result = await collection.insertOne(req.body)
        resp.send({message:"data stored", success: true, result:result});

    })

    // delete data through api
    app.delete("/delete/:id", async(req,resp)=>{
        console.log(req.params.id);
        const collection = db.collection("students");
        const result = await collection.deleteOne({_id: new ObjectId(req.params.id)})
        if(result){
            resp.send({
                message: "student deleted",
                success: true
            })
        }else{
            resp.send({
                message: "deletion failed",
                success: false
            })
        }
    })
    // delete data through ui
     app.get("/ui/delete/:id", async(req,resp)=>{
        console.log(req.params.id);
        const collection = db.collection("students");
        const result = await collection.deleteOne({_id: new ObjectId(req.params.id)})
        if(result){
           resp.send("<h1>Student deleted</h1>");

        }else{
            resp.send("<h1>Student deletion failed</h1>");

        }
    })

    // populate date to update page  through ui
    app.get("/ui/student/:id", async(req,resp)=>{
        //console.log(req.params.id);
        const collection = db.collection("students");
        const result = await collection.findOne({_id: new ObjectId(req.params.id)})
        resp.render('update',{result});
    })
    //update the data through ui
    app.post("/ui/student/:id", async(req,resp)=>{
        try{
            const collection = db.collection("students");
            const {name, age, email, college} = req.body;
            const result = await collection.updateOne(
                {_id: new ObjectId(req.params.id)},
                {$set: {
                    name : name, 
                    age : age, 
                    email : email, 
                    college : college
                }}
            );
            resp.redirect('/ui');
        }catch(error){
            console.error("Error updating student:", error);
            resp.send("update failed");
        }
    });
        
    // update data through api
    app.get("/student/:id", async(req,resp)=>{
        //console.log(req.params.id);
        const collection = db.collection("students");
        const result = await collection.findOne({_id: new ObjectId(req.params.id)})
        resp.send({
            message: "student data fetched",
            success: true,
            result: result
        })
    })
           
    app.listen(3000,()=>{
        console.log("Server is running on port 3000");
    });
})