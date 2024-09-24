// controllers/mentorController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Mentor } from '../models/mentorModels/mentor.model.js'; // Adjust the path as needed
import cloudinary from "../utils/cloudinary.js";; // If using Cloudinary for image uploads
import getDataUri from '../utils/datauri.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

export const mentorRegister = async (req, res) => {
  try {
    const { fullname,email,phoneNumber,password,currentRole,expertise,experienceYears,availability,hourlyRate,targetDomain,additionalInfo} = req.body;
    
   //console.log(req.body);
    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return res.status(400).json({ message: 'Mentor already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
   
   //console.log(hashedPassword+" i am hashed passowrd")

    // Upload profile picture if available
    let profilePhoto = '';
     
        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        profilePhoto=cloudResponse.secure_url;
    

    // Create new mentor
    const newMentor = new Mentor({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      currentRole,
      expertise,
      experienceYears,
      availability,
      hourlyRate,
      targetDomain,
      additionalInfo,
      
      profilePhoto
    });

    await newMentor.save();
 
    res.status(201).json({ message: 'Mentor registered successfully', mentor: newMentor,success:true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/mentorController.js

export const mentorLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      // console.log(req.body)
      // Find mentor by email
      const mentor = await Mentor.findOne({ email });

   //console.log(mentor)

      if (!mentor) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, mentor.password);
     // console.log('i am isMacth',isMatch)





      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      //console.log("i  am just before generating token")
      // Generate JWT token
      const token = jwt.sign({ id: mentor._id, role: 'mentor' }, process.env.SECRET_KEY, { expiresIn: '1h' });
  
      res.json({ mentor,message: 'Login successful', token,success:true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  export const getMentorProfile = async (req, res) => {
    try {
        const mentorId = req.params.id;
       // const mentor = await Mentor.findById(mentorId).populate('mentees').populate('sessions').exec();
        const mentor = await Mentor.findById(mentorId);

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.status(200).json({ success: true, mentor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
  


export const getAllMentors = async (req, res) => {
  try {
     // const mentors = await Mentor.find().populate('mentees').populate('sessions');
     const mentors = await Mentor.find();
      res.status(200).json({
          success: true,
          data: mentors,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Server error. Unable to fetch mentors.',
      });  
  }
};




export const updateMentorProfile = async (req, res) => {

  //console.log("upate recevied")
  try {
    const mentorId = req.params.id;
    const {
      fullname,
      email,
      phoneNumber,
      currentRole,
      expertise,
      experienceYears,
      availability,
      hourlyRate,
      targetDomain,
      additionalInfo,
    } = req.body;

    // Find the mentor by ID
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
   //console.log(req.file+"i am file")
    // Update the profile photo if a new one is provided
    if (req.file) {
      const file = req.file;
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      mentor.profilePhoto = cloudResponse.secure_url;
    }

    // Update mentor details
    if (fullname) mentor.fullname = fullname;
    if (email) mentor.email = email;
    if (phoneNumber) mentor.phoneNumber = phoneNumber;
    if (currentRole) mentor.currentRole = currentRole;
    if (expertise) mentor.expertise = expertise;
    if (experienceYears) mentor.experienceYears = experienceYears;
    if (availability) mentor.availability = availability;
    if (hourlyRate) mentor.hourlyRate = hourlyRate;
    if (targetDomain) mentor.targetDomain = targetDomain;
    if (additionalInfo) mentor.additionalInfo = additionalInfo;

    // Save the updated mentor profile
    await mentor.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', mentor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};