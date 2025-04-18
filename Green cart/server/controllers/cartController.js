
// upadate user cart data : /api/cart/update

// import User from "../models/user.js"

// export const updateCart = async (req , res)=>{
//     try {
//         const {userId , cartItems} = req.body
//         await User.findByIdAndUpdate(userId,{cartItems})
//         res.json({success:true ,message:"Cart updated"})
//     } catch (error) {
//         console.log(error.message)
//         res.json({success:false,message:error.message})
//     }
// }

import User from "../models/user.js";

export const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const userId = req.userId; // ✅ coming from auth middleware

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authorized" });
        }

        await User.findByIdAndUpdate(userId, { cartItems });

        res.json({ success: true, message: "Cart updated" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
