'use strict'

const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
    },
    publishDate: {type: Date, required: false}
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

const Posts = mongoose.model("Posts", postSchema)

module.exports = {Posts}