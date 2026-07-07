const productService = require("../services/productService");


const productController = {

    getProducts: async (req,res)=>{

        try{

            const {
                page = 1,
                limit = 10,
                search = "",
                category_id,
                store_id
            } = req.query;


            const result = await productService.getAll({
                page: Number(page),
                limit: Number(limit),
                search,
                category_id,
                store_id
            });


            res.status(200).json({

                success:true,

                data:result.data || [],

                pagination:result.pagination || {}

            });



        }catch(error){

            console.log(error);


            res.status(500).json({

                success:false,

                message:"Lỗi lấy sản phẩm",

                error:error.message

            });

        }

    },



    getProductById: async(req,res)=>{

        try{


            const product = await productService.getById(req.params.id);


            if(!product){

                return res.status(404).json({

                    success:false,

                    message:"Không tìm thấy sản phẩm"

                });

            }


            res.json({

                success:true,

                data:product

            });


        }catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    },



    createProduct: async(req,res)=>{

        try{


            const id = await productService.create({
                ...req.body,
                file: req.file
            });


            res.status(201).json({

                success:true,

                message:"Thêm sản phẩm thành công",

                id

            });


        }catch(error){

            res.status(500).json({

                success:false,

                message:error.message

            });

        }

    },



    updateProduct: async(req,res)=>{

        try{


            await productService.update(req.params.id, req.body, req.file);


            res.json({

                success:true,

                message:"Cập nhật thành công"

            });


        }catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }

    },



    deleteProduct: async(req,res)=>{

        try{


            await productService.delete(
                req.params.id
            );


            res.json({

                success:true,

                message:"Xóa sản phẩm thành công"

            });


        }catch(error){


            res.status(500).json({

                success:false,

                message:error.message

            });


        }

    }

};


module.exports = productController;