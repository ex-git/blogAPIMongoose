'use strict'

const mongoose = require("mongoose")

const authorSchema = mongoose.Schema({
    author: {
        firstName:{type:String, required: true},
        lastName:{type:String, required: true},
        userName:{type: String, required: true}
    }
})

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "Author"},
    publishDate: {type: Date, required: false}
})

postSchema.pre("find", function() {
    this.populate("author");
})

postSchema.pre("findOne", function() {
    this.populate("author");
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
        publishDate: this.pubishDateReformated
    }
}

const Posts = mongoose.model("Post", postSchema)
const Authors = mongoose.model("Author", authorSchema)

module.exports = {Posts}