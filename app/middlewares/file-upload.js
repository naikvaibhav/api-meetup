const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");
dotenv.config();

aws.config.update({
  secretAccessKey: process.env.Secret_Access_Key,
  accessKeyId: process.env.Access_Key_ID,
  region: "ap-south-1",
});

const s3 = new aws.S3();

/* In case you want to validate your file type */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Wrong file type, only upload JPEG and/or PNG !"), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      req.file = file.originalname;

      cb(null, file.originalname);
    },
  }),
});

module.exports = upload;
