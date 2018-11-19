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
function seedPostsData() {
    console.info('seeding posts data');
    const seedPosts = []
    for (let i =0; i <10; i++) {
        let post = generatePost();
        post.author = Authors.findOne({})._id
        seedPosts.push(post)
        console.info(post)
    }
    return Posts.insertMany(seedPosts)
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

//add 10 authors to the test database
function seedAuthorsData() {
    console.info("seeding authors data")
    const seedAuthors = [];
    for (let i=0; i<10; i++) {
        seedAuthors.push(generateAuthor())
    }
    return Authors.insertMany(seedAuthors)
}

function dropDb() {
    console.info('dropping test database')
    return mongoose.connection.dropDatabase();
}

describe("Test Author CRUD", function() {
    before(function() {
        return startServer(TEST_DATABASE_URL)
    })
    after(function(){
        return stopServer()
    })
    beforeEach(function() {
        return seedAuthorsData()
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
                })
            })
        })
    })
})

describe("posts CRUD test", function(){
    before(function() {
        return startServer(TEST_DATABASE_URL).then(seedAuthorsData())
    })
    after(function(){
        return stopServer()
    })
    beforeEach(function(){
        seedAuthorsData()
        return seedPostsData()
    })
    afterEach(function() {
        // return dropDb()
    })
    describe("posts GET endpoint", function(){
        it("should return posts on GET", function(){
            return chai.request(app)
            .get("/posts")
            .then(function(res){
                expect(res).to.be.json;
                expect(res).to.have.status(200);
                expect(res.body).to.be.a("array")
                expect(res.body.length).to.be.equal(10)
            })
        })
    })
    
})