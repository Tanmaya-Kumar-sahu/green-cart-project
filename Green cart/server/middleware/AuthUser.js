// import jwt from 'jsonwebtoken'

// const authUser = async (req , res , next)=>{
//     const {token} = req.cookies;

//     if(!token){
//         return res.json({success: false , message: 'Not authorized'})
//     }


//     try {
//         const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
//         if(tokenDecode.id){
//             req.userId = tokenDecode.id;
//             next();
//         }else{
//             return res.json({success:false , message:'Not Authorized'})
//         }
        

//     } catch (error) {
//        res.json({success:false , message: error.message}) 
//     }


// }

// export default authUser;

import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const { token } = req.cookies;  // Retrieve token from cookies

    if (!token) {
        return res.json({ success: false, message: 'Not authorized' }); // If no token, return error
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
        if (decodedToken.id) {
            req.userId = decodedToken.id;  // Attach user ID to the request
            return next();   // Proceed to the next middleware or route handler
        } else {
            return res.json({ success: false, message: 'Not Authorized' }); // If no ID, return error
        }
         
    } catch (error) {
        return res.json({ success: false, message: error.message }); // Catch errors and return message
    }
};

export default authUser;
