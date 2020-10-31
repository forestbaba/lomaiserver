const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./userModel");
const keys = require('../config/keys');
const path = require('path');


router.post("/signup", (req, res) => {

    if (!req.body.name || !req.body.email || !req.body.username || !req.body.password) {
        return res.status(400).json({error: true, message:"All fields are required"})
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(422).json({ error: "email already exist" });
        } else {
                    console.log('===else=')

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then(reguser => {
                        res.json({ reguser })
                    }).catch(err => res.status(400).json({ error: err }))
                });
            });

        }
    });

})

router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = {}

    User.findOne({ email: req.body.email })
        .then(user => {
            console.log("here 1" + req.body.email);
            if (user) {
                bcrypt
                    .compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: user.id,
                                email: user.email,
                                username: user.username,
                                name: user.name,
                            }
                            jwt.sign(payload, keys.secretOrKey, { expiresIn: 86400 }, (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token,
                                    user: payload
                                })

                            });



                        } else {
                            errors.password = "Email or Password is incorrect";
                            return res.status(400).json(errors);
                        }
                    })
                    .catch(err => console.log(err));
                console.log("here 2");
            } else {
                return res.status(400).json({error: true, message:"User does not exist"})
            }
        })
});


module.exports = router;