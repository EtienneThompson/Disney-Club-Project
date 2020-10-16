var express = require("express");
var fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");
var cors = require("cors");
var FileService = require("./services/FileServices");
require("dotenv").config();

const router = express.Router();

/*
* Setup api routes.
*/
let routes = (app) => {
    router.post("/upload", FileService.upload);
    router.post("/write", FileService.writeJSON);
    router.post("/new", FileService.newUser);
    router.get("/user", FileService.findUser);
    router.get("/find", FileService.findJSON);
    router.get("/photo", FileService.findImage);

    app.use(router);
};

var corsOptions = {
    origin: `http://${process.env.ORIGIN}`,
};

const app = express();

/*
* Setup server to receive requests.
*/
app.use(cors(corsOptions));

app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
// Setup directory as static image server.
app.use("/images", express.static("images"));
routes(app);

let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Running at port ${port}`);
})