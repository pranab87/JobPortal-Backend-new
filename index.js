import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import mentorRoute from "./routes/mentor.route.js";
import bodyParser from 'body-parser'

import nodemailer from 'nodemailer';
import { Mentor } from "./models/mentorModels/mentor.model.js";

import Stripe from 'stripe';
dotenv.config({});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://jobportal-vn4u.onrender.com'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));




app.use(bodyParser.json());


const PORT = process.env.PORT || 3000;


// Payment Route
app.post("/payment", async (req, res) => {
    const price = req.body;
    console.log(price);
  
    const lineitems = [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "MENTORS PAYMENT", // Replace with your actual product name
          },
          unit_amount: Math.round(price.product * 100), // Stripe expects amount in cents/paise
        },
        quantity: 1, // You can adjust the quantity as needed
      },
    ];
    
  
    const session = await stripe.checkout.sessions.create({
      // payment_methods_types:["card"],
      line_items: lineitems,
      mode: "payment",
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.FAILURE_URL,
    });
  
    
  
  
    res.json({id:session.id})
  });
  



// Other routes and email setup
app.post("/send-email", async (req, res) => {
    const { student, mentor,studentId } = req.body;
   // console.log(req.body);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "codecraze37@gmail.com",
            pass: process.env.GOOGLE_PASS_KEY,
        },
    });

    const studentEmailOptions = {
        from: "codecraze37@gmail.com",
        to: student.email,
        subject: "Payment Confirmation",
        text: `Hello ${student.name},\n\nThank you for your payment. Your transaction has been completed successfully. Our Mentor will contact you soon.\n\nBest regards,\nCodeCraze`
    };

    const mentorEmailOptions = {
        from: "codecraze37@gmail.com",
        to: mentor.email,
        subject: "New Student Payment",
        text: `Hello Mentor ${mentor.fullname},\n\nA new student has completed their payment. Here are their details:\n\nName: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone}\nCity: ${student.city}\nCollege: ${student.college}\nDomain: ${student.domain}\nLecture Time: ${student.lectureTime}\nSkills: ${student.skills}\n\nBest regards,\nCodeCraze`
    };

    // Send email to student
    transporter.sendMail(studentEmailOptions, (error, emailResponse) => {
        if (error) {
            console.error("Error sending email to student:", error);
            res.status(500).send("Failed to send email to student");
            return;
        }
     //   console.log("Email sent to student successfully!");

        // Send email to mentor after student email is sent successfully
        transporter.sendMail(mentorEmailOptions, (error, emailResponse) => {
            if (error) {
                console.error("Error sending email to mentor:", error);
                res.status(500).send("Failed to send email to mentor");
                return;
            }
            //console.log("Email sent to mentor successfully!");
            res.status(200).send("Emails sent successfully");
        });
        
        
    });
    const mentorfind = await Mentor.findById(mentor._id);
   // console.log("i am mentorfind",mentorfind);
    

    if (mentorfind) {
        mentorfind.mentees.push(studentId._id);
        await mentorfind.save();
        console.log("successfully saved mentee")
    } else {
        console.error("Mentor not found");
    }
    
});






// API routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/mentor", mentorRoute);

app.get('/',(req,res)=>{
  res.send("Api Is Working")
})


app.listen(PORT, () => {
    connectDB();
    console.log(`Server running at port ${PORT}`);
});
