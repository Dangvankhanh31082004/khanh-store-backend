const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const manageRoles = ['staff', 'manager', 'admin', 'owner'];
const deleteRoles = ['manager', 'admin', 'owner'];

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
    authenticate,
    authorize(manageRoles),
    productController.createProduct
);


// UPDATE PRODUCT
router.put(
    "/:id",
    authenticate,
    authorize(manageRoles),
    productController.updateProduct
);


// DELETE PRODUCT
router.delete(
    "/:id",
    authenticate,
    authorize(deleteRoles),
    productController.deleteProduct
);


module.exports = router;