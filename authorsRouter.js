'use strict'

const express = require("express");
const authorsRouter = express.Router();
const {Authors, Posts} = require("./models")

authorsRouter.get("/:id", (req,res)=> {
    Authors.findById(req.params.id)
    .then(author=>{
        res.status(200).json(author)
    })
    .catch(err=> {
        console.error(err)
        res.status(500).json({"message": "Internal Server Error"})
    })
})

authorsRouter.put("/:id", (req,res)=>{
    const updateAuthor = {}
    const requiredFields = ["firstName", "lastName", "userName"]
    for (let field of requiredFields) {
        if (!(field in req.body)) {
            res.status(400).send(`${field} is missing in request body`)
        }
    }
    requiredFields.forEach(field =>{
        updateAuthor[field] = req.body[field]
    })
    Authors.findOne({"userName": req.body.userName}).then(author=>{
    Authors.findByIdAndUpdate(req.params.id, {$set: updateAuthor})
    .then(author=>{
        res.status(201).json(
            {"First Name": author.firstName,
        "Last Name": author.lastName,
        "User Name": author.userName})
    })
    .catch(err=>{
        res.status(500).send(`User name ${req.body.userName} already exist`)
    })})
})

authorsRouter.post("/", (req,res)=> {
    const requiredFields = ["firstName", "lastName", "userName"]
    for (let field of requiredFields) {
        if (!(field in req.body)) {
            res.status(400).send(`${field} is missing in post body`)
        }
    }
    Authors.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName
    })
    .then(author=>{
        res.status(201).json(author)
    })
    .catch(err=> {
        console.error(err)
        res.status(500).json({"message": "Internal Server Error"})
    })
})

authorsRouter.delete("/:id", (req,res)=>{
    Authors.findByIdAndRemove(req.params.id)
    .then(
        Posts.remove({author:req.params.id}).then(
        res.status(204)
        .end()
        )
        
    )
    .catch(err=>console.error(err))
})

module.exports = authorsRouter;