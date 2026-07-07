const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");


// GET ALL PRODUCTS
router.get(
    "/",
    productController.getProducts
);


// GET PRODUCT BY ID
router.get(
    "/:id",
    productController.getProductById
);


// CREATE PRODUCT
router.post(
    "/",
    productController.createProduct
);


// UPDATE PRODUCT
router.put(
    "/:id",
    productController.updateProduct
);


// DELETE PRODUCT
router.delete(
    "/:id",
    productController.deleteProduct
);


module.exports = router;