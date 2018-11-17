'use strict'

const mongoose = require("mongoose")

const authorSchema = mongoose.Schema({
        firstName:String,
        lastName:String,
        userName:{type: String, unique: true}
})

const commentSchema = mongoose.Schema({
    comment: String
})

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "Author"},
    publishDate: {type: Date, required: false},
    comments: [commentSchema]
})

postSchema.pre("find", function(next) {
    this.populate("author");
    next()
})

postSchema.pre("findOne", function(next) {
    this.populate("author");
    next()
})

postSchema.virtual("authorFullName").get(function(){
    return `${this.author.firstName} ${this.author.lastName}`.trim()
})

postSchema.virtual("pubishDateReformated").get(function(){
    if (!(this.publishDate)) {
        return ""
    }
    else {return `${this.publishDate}`}
})

postSchema.methods.cleanResponse = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorFullName,
        publishDate: this.pubishDateReformated,
        comments: this.comments
    }
}

const Posts = mongoose.model("Post", postSchema)
const Authors = mongoose.model("Author", authorSchema)

module.exports = {Posts, Authors}