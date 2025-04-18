import {v2 as cloudinary} from 'cloudinary'
import Product from '../models/Product.js'
// Add Product: /api/product/add

export const addProduct = async (req , res)=>{

    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result =await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                return result.secure_url
            })
        )

         await Product.create({...productData,image:imagesUrl})

         res.json({success:true , message:"product added"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }

}



// Get Product: /api/product/list

export const productList = async (req , res)=>{
    try {
        const products = await Product.find({})
        res.json({success:true , products})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}


// Get Single Product: /api/product/add

export const productById = async (req , res)=>{
    try {
        const {id} = req.body
        const product = await Product.find(id)
        res.json({success:true , product})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

// Change Product in stock: /api/product/stock

export const changeStock = async (req , res)=>{
    try {
        const {id , inStock} = req.body
        await Product.findByIdAndUpdate(id , {inStock})
        res.json({success:true,message:"stock Updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}