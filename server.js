require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const cors = require("cors")
const dns = require("dns")
const urlparser = require("url")
const { isRegExp } = require("util")
const app = express()

const port = process.env.PORT || 3000
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const schema = new mongoose.Schema({ url: "string" })
const Url = mongoose.model("Url", schema)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html")
})

// app.post("/api/shorturl", async (req, res) => {
//   const bodyurl = req.body.url  dns.lookup(bodyurl, (data) => {
//     console.log("dns =====>>>>> ", data)
//   })
//
//   const url = new Url({ url: req.body.url })
//   await url.save((err, data) => {
//     res.json({ created: true })
//   })
// })

app.post("/api/shorturl", (req, res) => {
  const bodyurl = req.body.url
  const something = dns.lookup(
    urlparser.parse(bodyurl).hostname,
    (error, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" })
      } else {
        const url = new Url({ url: bodyurl })
        url.save((err, data) => {
          res.json({
            original_url: data.url,
            short_url: data.id,
          })
        })
      }
      console.log("dns", error)
      console.log("address", address)
    }
  )
  console.log("something", something)
})

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "Invalid URL" })
    } else {
      res.redirect(data.url)
    }
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port} ...`)
})
