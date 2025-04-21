

import Order from "../models/order.js"
import Product from "../models/Product.js"
import stripe from 'stripe'
import User from "../models/user.js"
// Place Order Cod :/api/order/cod
export const placeOrderCod = async (req , res) => {
    try {
        const {userId , items , address} = req.body

        if(!address || items.length === 0){
            return res.json({success:false , message : "Invalid data"})
        }

        //calculate amount using item 

        let amount = await items.reduce(async (acc , item) =>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice*item.quantity;
        },0)

        // Add Tax Charge 2%

        amount += Math.floor(amount *0.2);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"COD",
        });

        
        return res.json({success:true,message:'Order place succesfully'})
    } catch (error) {
        return res.json({success:false , message:error.message})
    }
}


// Place Order Stripe :/api/order/stripe
export const placeOrderStripe = async (req , res) => {
    try {
        const {userId , items , address} = req.body
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success:false , message : "Invalid data"})
        }

        let productData = []

        //calculate amount using item 

        let amount = await items.reduce(async (acc , item) =>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            })
            return (await acc) + product.offerPrice*item.quantity;
        },0)

        // Add Tax Charge 2%

        amount += Math.floor(amount *0.2);

        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"Online",
        });

        // Stripe getway initialize

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
         // create line items for stripe

         const line_items = productData.map((item)=>{
            return{
                price_data: {
                    currency:"usd",
                    product_data: {
                        name:item.name
                    },
                    unit_amount:Math.floor(item.price * 1.02 *100)
                },
                quantity:item.quantity
            }
         }) 

        // carate session

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url:`${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        return res.json({success:true,url : session.url})
    } catch (error) {
        return res.json({success:false , message:error.message})
    }
}

//stripe webhook to verify payment action :/stripr

// export const stripeWebHook = async (request , response) =>{
//     //stripe getway initialize

//     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

//     const sig = request.headers["stripe-signature"];
//     let event;

//     try {
//         event = stripeInstance.webhooks.constructEvent(
//             request.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET
//         );
//     } catch (error) {
//         response.status(400).send(`Webhook error: ${error.message}`)
//     }

//     // handle event

//     switch (event.type) {
//         case "checkout.session.completed":{
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             //Getting session metadata

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             });

//             const {orderId,userId} = session.data[0].metadata;


//             //Mark payment as paid

//             await Order.findByIdAndUpdate(orderId,{isPaid: true})

//             //clear user cart

//             await User.findByIdAndUpdate(userId,{cartItems:{}})
//             break;
//         }case "checkout.session.async_payment_failed" :{
//             const paymentIntent = event.data.object;
//             const paymentIntentId = paymentIntent.id;

//             //Getting session metadata

//             const session = await stripeInstance.checkout.sessions.list({
//                 payment_intent: paymentIntentId,
//             });

//             const {orderId} = session.data[0].metadata;
//             await Order.findByIdAndDelete(orderId)
//         }
            
            
    
//         default:
//             console.error(`unhandles event type ${event.type}`)
//             break;
//     }

//     response.json({received : true})
// }

export const stripeWebHook = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const { orderId, userId } = session.metadata;

            await Order.findByIdAndUpdate(orderId, { isPaid: true });
            await User.findByIdAndUpdate(userId, { cartItems: {} });
            break;
        }

        case "checkout.session.async_payment_failed": {
            const session = event.data.object;
            const { orderId } = session.metadata;

            await Order.findByIdAndDelete(orderId);
            break;
        }

        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};



//get orders by userid : /api/order/user

export const getUserOrder = async (req ,res)=>{
    try {
        const  userId = req.userId
        const orders = await Order.find({
            userId,
            $or : [{paymentType:"COD"} , {isPaid : true}]
        }).populate("items.product address").sort({createdAt : -1});

        res.json({success:true , orders})
    } catch (error) {
        res.json({success:false , message:error.message})
    }
}

//Get all Orders (for seller/admin) : /api/order/seller

export const getAllOrders = async (req ,res)=>{
    try {
        const orders = await Order.find({

            $or : [{paymentType:"COD"} , {isPaid : true}]
        }).populate("items.product address").sort({createdAt : -1});

        res.json({success:true , orders})
    } catch (error) {
        res.json({success:false , message:error.message})
    }
}