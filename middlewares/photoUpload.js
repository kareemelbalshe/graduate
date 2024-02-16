import path from "path"
import multer from "multer";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// const __dirname = path.resolve();


const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"))
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
        }
        else {
            cb(null, false)
        }
    }
})

export const photoUpload = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {//image/png
            cb(null, true)
        }
        else {
            cb({ message: "unsupported file format" }, false)
        }
    },
    limits: { fileSize: 1024 * 1024 * 20 }
})
