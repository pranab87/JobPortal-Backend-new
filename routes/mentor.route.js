import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import { getAllMentors, getMentorProfile, mentorLogin, mentorRegister, updateMentorProfile } from "../controllers/mentor.controller.js";
 
const router = express.Router();

router.route("/signup").post(singleUpload,mentorRegister);
router.route("/login").post(mentorLogin);
router.route("/get/:id").get(getMentorProfile);
router.route("/getallmentors").get(getAllMentors);
router.route('/update/:id').post(singleUpload,updateMentorProfile);


//router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);

export default router;

