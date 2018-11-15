'use strict'

const express = require("express");
const router = express.Router();

const {Posts} = require("./models");

router.get("/", (req, res)=> {
    Posts.find()
    .then(posts => {
        res.status(200).json({
            posts: posts.map(post=>post.cleanResponse())
        })
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    })
})

router.get("/:id", (req,res) =>{
    Posts.findById(req.params.id)
    .then(post => {
        res.status(200).json({post: post.cleanResponse()})
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"})
})
})

router.post("/", (req,res)=>{
    const requiredFields = ["title","content","author"]
    for (let field of requiredFields) {
        if (!(field in req.body)) {
            res.status(400).send(`${field} is missing in post body`)
        }
    }
    Posts.create({
        title : req.body.title,
        content : req.body.content,
        author: req.body.author,
        publishDate : req.body.publishDate || new Date()
    })
    .then(post=>{
        res.status(201).json({post: post.cleanResponse()})
    })
    .catch(err=> {
        console.error(err);
        res.status(500).json({message: "Internal server error"})
    })
})


router.put("/:id",(req,res)=>{
    const requiredFields = ["id","title","content","author"];
    for (let field of requiredFields) {
        if (!(field in req.body)) {
            res.status(400).send(`${field} is missing in post body`)
        }
    if (req.body.id === req.params.id) {
        const updatePost = {}
        requiredFields.forEach(field=>{
            updatePost[field] = req.body[field]
        })
        Posts.findByIdAndUpdate(req.params.id, {$set: updatePost})
        .then(post=> res.status(204).json({post: post.cleanResponse}))
        .catch(err=>console.error(err))
    }
    else {
        res.status(500).json({"message": "Internal server error"})
    }
    }
})

router.delete("/:id", (req,res)=>{
    Posts.findByIdAndRemove(req.params.id)
    .then(post=> res.status(204).end())
    .catch(err=> {
        console.error(err);
        res.status(500).json({"message": "Internal Server error"})
})})


module.exports = router