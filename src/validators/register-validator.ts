import {  checkSchema } from "express-validator";
export default checkSchema({
    email : {
        errorMessage : 'Email is invalid',
        notEmpty : true,
        trim : true,
    }
})