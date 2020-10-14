var fs = require("fs");
var multer = require("multer");
var util = require("util");
var path = require("path");

const __basedir = path.resolve(__dirname + "/../");

/*
* Setup middleware for file uploading.
*/
var imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __basedir + "/images/games/bingo");
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
        // Upload the file.
        await uploadFileMiddleware(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        res.status(200).send({
            message: `Uploaded the file successfully: ${req.file.originalname}`,
        });
    } catch (err) {
        // More error checking.
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

    let status;
    try {
        // Try and write the given json to the given file.
        fs.writeFile(__basedir + filename, JSON.stringify(json), (err) => {
            if (err) {
                status = 500;
            }
            console.log("The file has been written");
        });

        // Return if error.
        if (status === 500) {
            return res.status(500).send({ message: err });
        }
        return res.status(200).send({
            message: `Updated json file successfully: ${filename}`,
        });
    } catch (err) {
        // Check for other errors.
        console.log(err);
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size cannot be larger than 2MB!",
            });
        }

        return res.status(500).send({
            message: `Could not update the file ${filename}`,
        });
    }
};

const newUser = (req, res) => {
    let netid = Object.keys(req.body)[0];
    // Create the directory.
    let status;
    fs.mkdir(__basedir + `/json/games/bingo/${netid}`, (err) => {
        if (err) {
            status = 500;
        }
    });

    // Copy the blank bingo_options to the new user's directory.
    fs.copyFile(__basedir + "/json/games/bingo/bingo_options.json", __basedir + `/json/games/bingo/${netid}/bingo_options.json`, (err) => {
        if (err) {
            status = 500;
        }
        console.log("File written");
    })
    if (status === 500) {
        return res.status(500).send({
            message: "Directory or file could not be created."
        });
    }
    return res.status(200).send(" File made.");
}

const findUser = (req, res) => {
    let netid = req.query.netid;
    // Check if the user's directory exists or not.
    fs.access(__basedir + `/json/games/bingo/${netid}`, function(error) {
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
    // Check if directory exists.
    fs.access(__basedir + `/json/games/bingo/${netid}`, function(error) {
        if (error) {
            status = 404;
        };
    });
    if (status === 404) {
        // Return if not.
        return res.status(404).send({
            message: "User's json file not found and/or directory has not been made."
        });
    }
    // Read the file.
    fs.readFile(__basedir + "/json/games/bingo/" + (netid ? `${netid}/` : "") + "bingo_options.json", 'utf-8', function(error, data) {
        if (error) {
            return res.status(404).send({
                message: "User's json file not found and/or directory has not been made."
            });
        };
        return res.status(200).send(JSON.stringify(data));
    });
}

module.exports = { upload, writeJSON, newUser, findUser, findJSON };