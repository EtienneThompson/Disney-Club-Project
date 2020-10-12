var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var multer = require("multer");
var util = require("util");
var cors = require("cors");

const baseUrl = "http://localhost:8080/files/";
const __basedir = __dirname + "/../";

/*
* Setup middleware for file uploading.
*/
var imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __basedir + "resources/static/assets/uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var uploadFile = multer({ storage: imageStorage }).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

/*
* Setup controller.
*/
const upload = async (req, res) => {
    try {
        await uploadFileMiddleware(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        res.status(200).send({
            message: `Uploaded the file successfully: ${req.file.originalname}`,
        });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }

        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};

const writeJSON = (req, res) => {
    let filename = req.body.filename;
    let json = req.body.json;

    try {
        fs.writeFile(__basedir + filename, JSON.stringify(json), (err) => {
            if (err) throw res.status.send({ message: err });
            console.log("The file has been written");
        });

        res.status(200).send({
            message: `Updated json file successfully: ${filename}`,
        });
    } catch (err) {
        console.log(err);
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }

        res.status(500).send({
            message: `Could not update the file ${filename}`,
        });
    }
};

const newUser = (req, res) => {
    let netid = Object.keys(req.body)[0];
    // Create the directory.
    let status;
    fs.mkdir(__basedir + `json/games/bingo/${netid}`, (err) => {
        if (err) {
            status = 500;
        }
    });

    fs.copyFile(__basedir + "json/games/bingo/bingo_options.json", __basedir + `json/games/bingo/${netid}/bingo_options.json`, (err) => {
        if (err) {
            status = 500;
        }
        console.log("File written");
    })
    // Read the original bingo_options file.
    // Write that to the bingo_options file in the user directory.
    // Copying might be easier.
    if (status === 500) {
        return res.status(500).send({
            message: "Directory or file could not be created."
        });
    }
    return res.status(200).send(" File made.");
}

const findUser = (req, res) => {
    let netid = req.query.netid;
    fs.access(__basedir + `json/games/bingo/${netid}`, function(error) {
        if (error) {
            console.log("no directory");
            return res.status(404).send({ message: "User does not exist." });
        }
        return res.status(200).send({ message: "User exists." });
    });
}

const findJSON = (req, res) => {
    let netid = req.query.netid;
    let status;
    fs.access(__basedir + `json/games/bingo/${netid}`, function(error) {
        if (error) {
            status = 404;
        };
    });
    console.log("directory found");
    fs.readFile(__basedir + `json/games/bingo/${netid}/bingo_options.json`, 'utf-8', function(error, data) {
        if (error) {
            status = 404;
        };
        if (status === 404) {
            return res.status(404).send({
                message: "User's json file not found and/or directory has not been made."
            });
        }
        return res.status(200).send(JSON.stringify(data));
    });
}

/*
* Setup server to receive requests.
*/
const router = express.Router();

let routes = (app) => {
    router.post("/upload", upload);
    router.post("/write", writeJSON);
    router.post("/new", newUser);
    router.get("/user", findUser);
    router.get("/find", findJSON);

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
