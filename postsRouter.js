'use strict'

const express = require("express");
const postsRouter = express.Router();
const {Posts, Authors} = require("./models");

postsRouter.get("/", (req, res)=> {
    Posts.find()
    .then(posts => {
        res.status(200).json(
            posts.map(post=>post.cleanResponse())
        )
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    })
})

postsRouter.get("/:id", (req,res) =>{
    Posts.findById(req.params.id)
    .then(post => {
        res.status(200).json({post: post.cleanResponse()})
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"})
})
})

postsRouter.post("/", (req,res)=>{
    const requiredFields = ["title","content","author_id"]
    for (let field of requiredFields) {
        if (!(field in req.body)) {
            res.status(400).send(`${field} is missing in post body`)
        }
    }
    Authors.findById(req.body.author_id)
    .then(author => {
    Posts.create({
        "title" : req.body.title,
        "content" : req.body.content,
        "author": req.body.author_id,
        "publishDate" : req.body.publishDate || new Date()
    })
    .then(post=>{
        res.status(201).json({post: {
            title: post.title,
            content: post.content,
            author: post.author,
            "publish Date" : post.publishDate
        }})
    })
    .catch(err=> {
        console.error(err);
        res.status(500).json({message: "Internal server error"})
    })})
    .catch(err=> {
        res.status(400).json({"message": "author id not found"})
    })
})

postsRouter.put("/:id",(req,res)=>{
    const requiredFields = ["id","title","content"];
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
        .then(post=> res.status(200).json({post: {
            id: post._id,
            title: post.title,
            content: post.content
        }}))
        .catch(err=>console.error(err))
    }
    else {
        res.status(500).json({"message": "Internal server error"})
    }
    }
})

postsRouter.delete("/:id", (req,res)=>{
    Posts.findByIdAndRemove(req.params.id)
    .then(post=> res.status(204).end())
    .catch(err=> {
        console.error(err);
        res.status(500).json({"message": "Internal Server error"})
})})


module.exports = postsRouter