const { request } = require('express');
const express = require('express');
const User = require('../models/User.js')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Harryisagoodboy';

//create a user using: post
router.post('/createuser', [
  body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({success, error: "sorry a user in this email already exits" })
      }
      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt)
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
      })
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET)
      // console.log(jwtData)
      // res.json(user )

      success = true
      res.json({ authtoken })

    } catch (error) {
      console.error(error.message)
      // res.statues(500).send("some error accured")
    }
  })


//Aurthanticate a user using: post
// router.post('/login', [
//     body('email', 'Enter a valid email').isEmail(),
//     body('password', 'Password cannot be blank').exists(),
// ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         const { email, password } = req.body;
//         try {
//             let user = await User.findOne({ email });
//             if (!user) {
//                 return res.status(400).json({ error: "please try to login with correct email id" })
//             }
//             const passwordCompare = await bcrypt.compare(password, user.password);
//             if (!passwordCompare) {
//                 return res.status(400).json({ error: "please try to login with corect email id" })
//             }
//             const data = {
//                 user: {
//                     id: user.id
//                 }
//             }
//             const authtoken = jwt.sign(data, JWT_SECRET)
//             res.json({ authtoken })

//         } catch (error) {
//             console.error(error.message)
//         }

//     })

router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
], async (req, res) => {

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  let success = false;
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({success, error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


})


// get user details
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})



module.exports = router

