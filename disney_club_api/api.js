var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var FileService = require("./services/FileServices");

/*
* Setup server to receive requests.
*/
const router = express.Router();

let routes = (app) => {
    router.post("/upload", FileService.upload);
    router.post("/write", FileService.writeJSON);
    router.post("/new", FileService.newUser);
    router.get("/user", FileService.findUser);
    router.get("/find", FileService.findJSON);

    app.use(router);
};

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
routes(app);

let port = 8080;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
})