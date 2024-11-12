import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import router from './routes/routes.js';
const app = express();
const PORT = 3000;

mongoose.connect(process.env.DB_URI)
    .then(() => console.log("Connected to database!"))
    .catch((error) => console.log("Database connection error:", error));

const db = mongoose.connection;
db.on('error', (error) => console.log(error));

//Middle Ware 
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(
    session({
        secret:"my secret key",
        saveUninitialized:true,
        resave:false
    })
);
app.use((req,res,next)=>{
    res.locals.message= req.session.message;
    delete req.session.message;
    next();
});

// set templete engine
app.set("view engine" , "ejs")


// routes prefix 
app.use("/", router);


app.use(express.static("uploads"));

app.listen(PORT, () => {
    console.log(`Server is started at port ${PORT}`);
});
