const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const Post = require("./postModel");
const path = require('path');


router.post("/create", (req, res) => {

    if (!req.body.post) {
        return res.status(400).json({ error: true, message: "post required" })
    }

    const newPost = new Post({
        post: req.body.post,
        user: req.body.user
    }).save().then(post => {
        return res.status(200).json({error: false, message:"Post created"})
    })
        .catch(err => {
        return res.status(200).json({error: true, message:"error creating post"})
    })

})

router.get('/fetchAll', (req, res) => {
    Post.find({})
        .then(post => {
        return res.status(200).json({error: false,posts:post})
        })
        .catch(err => {
        return res.status(400).json({error: true, message:'Error fetching posts'})
    })
})
module.exports = router;