var fs = require("fs");
var express = require("express");
var multer = require("multer");
var util = require("util");
var cors = require("cors");

const baseUrl = "http://localhost:8080/files/";
const __basedir = __dirname + "/../../";

/*
* Setup middleware for file uploading.
*/
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __basedir + "resources/static/assets/uploads/");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var uploadFile = multer({ storage: storage }).single("file");

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
        console.log(err);
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

const getListFiles = (req, res) => {
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            res.status(500).send({
                message: "Unable to scan files!"
            });
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: baseUrl + file,
            });
        });

        res.status.send(200).send(fileInfos);
    });
}

const download = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

/*
* Setup server to receive requests.
*/
const router = express.Router();

let routes = (app) => {
    router.post("/upload", upload);
    router.get("/files", getListFiles);
    router.get("/files/:name", download);

    app.use(router);
}

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
routes(app);

let port = 8080;
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
})
