var fs = require("fs");
var path = require("path");
var aws = require("aws-sdk");

const __basedir = path.resolve(__dirname + "/../");

/*
* Setup controller.
*/
const upload = async (req, res) => {
    if (!req.files) {
        return res.status(500).send("No file uploaded!");
    }

    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    const fileContent = Buffer.from(req.files.file.data, "binary");

    const params = {
        Bucket: 'disney-club-project',
        Key: req.files.file.name,
        Body: fileContent
    };

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
    })

    return res.status(200).send({
        message: `Uploaded the image file successfully`,
    });
};

const writeJSON = (req, res) => {
    let filename = req.body.filename;
    let json = req.body.json;

    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    const fileContent = Buffer.from(JSON.stringify(json));

    const params = {
        Bucket: 'disney-club-project',
        Key: filename,
        Body: fileContent
    };

    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
    })

    return res.status(200).send({
        message: "Uploaded the json file successfully"
    });
};

const newUser = (req, res) => {
    let netid = Object.keys(req.body)[0];
    console.log("New User Netid: " + netid);

    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    let fileContent;
    // Read the file.
    fs.readFile(__basedir + "/json/games/bingo/bingo_options.json", 'utf-8', function(error, data) {
        if (error) {
            console.log("Error: " + error);
            return res.status(404).send({
                message: "User's json file not found and/or directory has not been made."
            });
        };
        fileContent = JSON.stringify(data);

        const params = {
            Bucket: 'disney-club-project',
            Key: `json/games/bingo/${netid}/bingo_options.json`,
            Body: JSON.parse(fileContent)
        };

        console.log("Uploading new user's json configuration.");
        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
        })
    });
    return res.status(200).send(" File made.");
}

const findUser = (req, res) => {
    let netid = req.query.netid;
    console.log("Find User Netid: " + netid);
    let status = 200;
    // Check if the user's directory exists or not.
    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    const params = {
        Bucket: 'disney-club-project',
        Key: `json/games/bingo/${netid}/bingo_options.json`
    }

    var s3file = s3.getObject(params, function(err, data) {
        if (err) {
            return res.status(500).send({ message: "User does not exist." });
        } else {
            return res.status(200).send({ message: "User exists." });
        }
    });
}

const findJSON = (req, res) => {
    let netid = req.query.netid;

    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    const params = {
        Bucket: 'disney-club-project',
        Key: "json/games/bingo/" + (netid ? `${netid}/` : "") + "bingo_options.json"
    }

    var s3file = s3.getObject(params, function(err, data) {
        if (err) {
            console.log("Find JSON read file Error: " + err);
            return res.status(500).send({ message: "User does not exist." });
        } else {
            return res.status(200).send(JSON.stringify(data.Body.toString()));
        }
    });
}

const findImage = (req, res) => {
    let imageName = req.query.photo;

    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    });

    const s3 = new aws.S3();

    const params = {
        Bucket: 'disney-club-project',
        Key: imageName
    }

    var s3file = s3.getObject(params, function(err, data) {
        if (err) {
            console.log("Find Image read file Error: " + err);
            return res.status(500).send({ message: "User does not exist." });
        } else {
            fs.writeFile(__basedir + `/images/games/bingo/${data.ETag.replace(/"/g, '')}.${data.ContentType.toString().split("/")[1] === "jpeg" ? data.ContentType.toString().split("/")[1] : "png"}`, data.Body, function(err) {
                if (err) {
                    throw err;
                }
                return res.status(200).send(`${data.ETag.replace(/"/g, '')}.${data.ContentType.toString().split("/")[1] === "jpeg" ? data.ContentType.toString().split("/")[1] : "png"}`);
            });
        }
    });
}

module.exports = { upload, writeJSON, newUser, findUser, findJSON, findImage };