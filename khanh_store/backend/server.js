const express = require("express");
const fs = require('fs');
const path = require('path');
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir); }
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


// ================= MIDDLEWARE =================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(express.urlencoded({
    extended:true
}));


// ================= STATIC =================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname,"uploads")
    )
);
// Serve assets (e.g., placeholder images, CSS, etc.)
app.use(
    "/assets",
    express.static(
        path.join(__dirname, "../frontend/assets")
    )
);


// ================= ROUTES =================

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const storeRoutes = require("./routes/storeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


app.use("/api/auth",authRoutes);

app.use("/api/products",productRoutes);

app.use("/api/categories",categoryRoutes);

app.use("/api/stores",storeRoutes);

app.use("/api/orders",orderRoutes);

app.use("/api/customers",customerRoutes);

app.use("/api/dashboard",dashboardRoutes);



// TEST API

app.get("/api",(req,res)=>{
    res.json({
        message:"KHANH STORE API RUNNING"
    });
});



// TEST PRODUCT

app.get("/api/products-test",(req,res)=>{
    res.json({
        message:"PRODUCT API OK"
    });
});



// ================= 404 =================

app.use((req,res)=>{
    res.status(404).json({
        message:"API NOT FOUND",
        url:req.originalUrl
    });
});



// ================= ERROR =================

app.use((err,req,res,next)=>{

    console.log(err);

    res.status(500).json({
        message:"SERVER ERROR",
        error:err.message
    });

});



// ================= START =================

const PORT = process.env.PORT || 5000;
console.log("========== KHANH STORE SERVER 2026 ==========");
app.listen(PORT, "0.0.0.0", () => {
    console.log(`KHANH STORE SERVER RUNNING PORT ${PORT}`);
});