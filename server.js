const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()
const PORT = 3000


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection = 'movies'

MongoClient.connect(dbConnectionStr)
    .then (client => {
        console.log(`Connected to ${dbName}!`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

//Set up Middleware to handle messages and get them into a format that they can both use
app.use(express.urlencoded({extended : true}))//get ready to parse urls
app.use(express.json())//express process some json
app.use(cors())//prevent any cors errors in browser

app.get('/search', async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$Search" : { 
                    "autocomplete" : {
                        "query" : `${req.query.query}`,
                        "path" : "title",
                        "fuzzy" : {
                            "maxEdits" : 2, //allows 2 char substitutions in search to still return similar item
                            "prefixLength": 3 //user has to type atleast 3 chars before it can narrow down search
                        }
                    }
                }
            }
        ]).toArray()
        res.send(result)
    }catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async (req,res) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(req.params.id)
        })
        res.send(result)
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})

