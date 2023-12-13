const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const fetch = require("node-fetch");
const request = require('request');
const fs = require('fs');
const path = require('path');
const dirPath = path.join(__dirname, 'tmp');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());


app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/temp/"
}))
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");

});
app.get("/you", function(req, res) {
  res.render("index");
});

app.post("/convert", async (req, res) => {

  const url = req.body.urll;
  const videoId = url.substring(url.indexOf('=') + 1);



  if(
   videoId === undefined ||
   videoId === "" ||
   videoId === null
 ){
   return res.render("index", { success : false, message : "Please enter a video ID"});
 } else {

   const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
     "method": "GET",
     "headers": {
       "x-rapidapi-key": process.env.API_KEY,
       "x-rapidapi-host": process.env.API_HOST
       }
   });
    const fetchResponse = await fetchAPI.json();

    if (fetchResponse.status === "ok")
      return res.render("index", {
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link
      })
    else
      return res.render("index", {
        success: false,
        message: fetchResponse.msg
      });
  }
});


app.post('/audio', function(req, res) {
  res.contentType("video/avi");
  res.attachment("output.mp3");
 


  req.files.filee.mv("tmp/" + req.files.filee.name, function(err) {
    if (err) return res.send(err);
    console.log("file uploaded succesfuly");
  });

  ffmpeg('tmp/' + req.files.filee.name)
    .toFormat('mp3')
    .on('end', function() {
      console.log("done")
    })
    .on('error', function(error) {
      console.log('error occured=' + error.message)
    })
    .pipe(res, {
      end: true
    })

});

app.get("/Collection", function(req, res) {
  res.render("Collection");
});
app.post("/Collection", function(req, res) {
  fs.readdir(dirPath, (err, files) => {
    res.render(files.forEach(item));
  })

});






app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
