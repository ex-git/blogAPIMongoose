'use strict'

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");

// this makes the expect syntax available throughout this module
const expect = chai.expect;

// this makes http apps or external services possible
chai.use(chaiHttp);

const {app, startServer, stopServer} = require("../server");
const {DATABASE_URL, TEST_DATABASE_URL} = require("../config")
const {Posts, Authors} = require("../models")

//generate fake posts
function seedPostsData(num=5) {
    console.info('seeding posts data');
    seedAuthorsData(num).then(function(authors){
        
        for (let i =0; i <num; i++) {
            let post = generatePost();
            //get a random number
            // let skipNum = Math.floor(Math.random() * num)
            // Authors.findOne({}).skip(skipNum).then(function(author){
            //     post.author = author._id
            //     Posts.create(post)
            //     }
            // )
            post.author = authors[i]._id
            console.info(post)
            Posts.create(post)
        }
})
}

function generatePost() {
    return {
        title: faker.hacker.phrase(),
        content: faker.lorem.paragraph(),
        publishDate: faker.date.recent()
    }
}

//generate fake author
function generateAuthor() {
    let author = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
    }
    author.userName = `${author.firstName}.${author.lastName}`
    return author
}

//add n authors to the test database
function seedAuthorsData(num=5) {
    console.info("seeding authors data")
    const seedAuthors = [];
    for (let i=0; i<num; i++) {
        seedAuthors.push(generateAuthor())
    }
    return Authors.insertMany(seedAuthors)
}

function dropDb() {
    // console.warn('dropping test database')
    // return mongoose.connection.dropDatabase();
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
}

describe("Test Author CRUD", function() {
    before(function() {
        return startServer(TEST_DATABASE_URL)
    })
    after(function(){
        return stopServer()
    })
    beforeEach(function() {
        return seedPostsData(2)
    })
    afterEach(function(){
        return dropDb()
    })
    describe("author GET endpoint", function() {
        it("Shoul return author info when query with author ID", function() {
            return Authors
            .findOne()
            .then(function(author){
                const requiredFields = ["firstName", "lastName", "userName"];
                return chai.request(app)
                .get(`/author/${author._id}`)
                .then(function(res) {
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a("object");
                    expect(res.body).to.include.keys(requiredFields);
                    for (let field of requiredFields) {
                        expect(res.field).to.be.equal(author.field)
                    }
                })
            })
        })
    })
    describe("author POST endpoint", function(){
        it("should return new author info on POST", function(){
            const newAuthor = generateAuthor();
            return chai.request(app)
            .post("/author")
            .send(newAuthor)
            .then(function(res) {
                expect(res).to.be.json;
                expect(res).to.have.status(201);
                expect(res.body).to.be.a("object");
                for (let field of Object.keys(newAuthor)) {
                    expect(res.body.field).to.be.equal(newAuthor.field)
                }
            })
        })
    })
    describe("author PUT endpoint", function() {
        it("should return author info on PUT", function(){
            const newAuthorInfo = generateAuthor();
            return Authors.findOne()
            .then(function(author) {
                return chai.request(app)
                .put(`/author/${author.id}`)
                .send(newAuthorInfo)
                .then(function(res){
                    expect(res).to.be.json;
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.a("object")
                    for (let field of Object.keys(newAuthorInfo)) {
                        expect(res.body.field).to.be.equal(newAuthorInfo.field)
                    }
                })
            })
        })
    })
    describe("author DELETE endpoint", function(){
        it("should return empty and delete author in database on DETELE", function(){
            let targetAuthor
            return Authors.findOne()
            .then(function(author) {
                targetAuthor = author;
                return chai.request(app)
                .delete(`/author/${author.id}`)
                .then(function(res){
                    expect(res).to.have.status(204)
                    expect(res.body).to.be.empty
                    return Authors.findById(targetAuthor.id)
                })
                .then(function(_res){
                    expect(_res).to.be.null
                    return Posts.find({author: targetAuthor._id})
                })
                .then(function(res_post){
                    console.info(res_post)
                    expect(res_post).to.be.empty
                })
            })
        })
    })
})

describe("posts CRUD test", function(){
    before(function() {
        return startServer(TEST_DATABASE_URL)
    })
    beforeEach(function(){  
        return seedPostsData(2)
    })

    afterEach(function() {
        return dropDb()
    })
    after(function(){
        return stopServer()
    })
    describe("posts GET endpoint", function(){
        it("should return posts on GET", function(){
            return chai.request(app)
            .get("/posts")
            .then(function(res){
                const requiredFields = ["id", "title", "content", "author", "comments", "publishDate"]
                // console.log(res.body)
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("array");
                // expect(res.body.length).to.be.equal(8);
                res.body.forEach(function(post){
                    expect(post).to.include.keys(requiredFields)
                })
            })
        })
        it("should return single post on GET with ID", function() {
            return Posts.findOne({})
            .then(function(res_post) {
                return chai.request(app)
                .get(`/posts/${res_post._id}`)
                .then(function(res){
                    const requiredFields = ["id", "title", "content", "author", "comments", "publishDate"]
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body.post).to.include.keys(requiredFields);
                    expect(res.body.post.id).to.equal(`${res_post._id}`)
                })
            })
            
        })
    })
    describe("posts PUT endpoint", function() {
        it("should return post content with PUT and ID", function() {
            return Posts.findOne({})
            .then(function(post) {
                return chai.request(app)
                .put(`/posts/${post._id}`)
                .send({id:post._id,
                title: faker.hacker.phrase(),
                content: faker.lorem.paragraph()
                })
                .then(function(res) {
                    const requiredFields = ["id", "title", "content"]
                    expect(res).to.be.json;
                    expect(res).to.have.status(200);
                    expect(res.body.post).to.include.keys(requiredFields);
                    expect(res.body.post.id).to.equal(`${post._id}`)
                })
            })
        })
    })
    describe("posts POST endpoint", function(){
        it("should return new post with POST", function(){
            const testPost = generatePost()
            return Authors.findOne({})
            .then(function(author){
                testPost.author_id = author._id;
                return chai.request(app)
                .post("/posts")
                .send(testPost)
                .then(function(res){
                    const requiredFields = ["title", "content", "author", "publish Date"]
                    expect(res).to.be.json;
                    expect(res).to.have.status(201);
                    expect(res.body.post).to.include.keys(requiredFields);
                    // expect(res.body.post.id).to.equal(`${post._id}`)
                })
            })
        })
    })
    describe("delete POST endpoint", function(){
        it("should return empty and delete POST", function(){
            let res_2nd
            return Posts.findOne()
            .then(function(res_post){
                res_2nd = res_post
                return chai.request(app)
                .delete(`/posts/${res_post._id}`)
                .then(function(res){
                    expect(res).to.have.status(204)
                    expect(res.body).to.be.empty
                })
            })
            .then(function() {
                return Posts.findById(res_2nd._id)
                .then(function(res){
                    expect(res).to.be.null
                }
                )}
            )
        })
    })
})