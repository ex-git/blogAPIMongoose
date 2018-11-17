'use strict'

const mongoose = require("mongoose");
const express = require("express");
const {PORT, DATABASE_URL} = require("./config");
mongoose.Promise = global.Promise;

const app = express();
app.use(express.json())

const postsRouter = require("./postsRouter")
const authorsRouter = require("./authorsRouter")

//server start and stop control

let server;

function startServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl,{useNewUrlParser: true }, err => {
            if (err) {
                return reject(err)
            }
            server = app.listen(port, ()=> {
            console.log(`Your app is running on port ${port}`);
            resolve()})
            .on("error", err => {
                mongoose.disconnect();
                reject(err);
            })
        })
    })
}

function stopServer() {
    mongoose.disconnect()
    .then(()=>{
        app.close(err =>{
            if (err) {
                console.err(err);
                return reject(err)
            }
            resolve()
        })
    })
}


if (require.main === module) {
    startServer(DATABASE_URL).catch(error=>console.error(error))
}

app.use("/posts", postsRouter);
app.use("/author", authorsRouter);
app.use("*", (req,res)=>{
    res.status(404).json({"message": "Not found"})
})

module.exports = {app, startServer, stopServer}