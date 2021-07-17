require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})

/* Database Connection */
let uri =
  "mongodb+srv://brahim:" +
  process.env.PW +
  "@cluster0.nab8p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(uri, { userNewUrlParser: true, useUnifiedTopology: true })

/*Creating the url model */
let urlSchema = new mongoose.Schema({
  orginal: { type: String, required: true },
  short: Number,
})

let Url = mongoose.model("Url", urlSchema)

/* getting the url parameter*/
let bodyParser = require("body-parser")

let responseObject = {}
app.post(
  "/api/shorturl/new",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let inputUrl = req.body["url"]
    responseObject["original_url"] = inputUrl
    /*pass url as parameter and then receive json shortened url */
    let inputShort = 1

    Url.findOne({})
      .sort({ short: "desc" })
      .exec((error, result) => {
        if (!error && result != undefined) {
          inputShort = result.short + 1
        }
        if (!error) {
          Url.findOneAndUpdate(
            { original: inputUrl },
            { original: inputUrl, short: inputShort },
            { new: true, upsert: true },
            (error, savedUrl) => {
              if (!error) {
                responseObject["short_url"] = savedUrl.short
                res.json(responseObject)
              }
            }
          )
        }
      })
  }
)

//     res.json(responseObject)
//   }
// )


app.get("/api/shorturl/:input", (request, response) => {
  let input = request.params.input

  Url.findOne({ short: input }, (error, result) => {
    if (!error && result != undefined) {
      response.redirect(result.original)
    } else {
      response.json("URL not Found")
    }
  })
})