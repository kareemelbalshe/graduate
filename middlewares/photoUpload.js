import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';

// Get the directory name of the current module file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Uncomment the following line if you need to resolve the directory path differently
// const __dirname = path.resolve();

// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com

// Configure the storage settings for multer
const photoStorage = multer.diskStorage({
    // Set the destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../images"));
    },
    // Set the filename for uploaded files
    filename: function (req, file, cb) {
        if (file) {
            // Create a unique filename using the current date and the original filename
            cb(null, "DOC" + new Date().toISOString().replace(/:/g, "-") + file.originalname);
        } else {
            cb(null, false);
        }
    }
});

// Create a multer instance for handling file uploads
export const photoUpload = multer({
    storage: photoStorage,
    // Filter files based on their MIME type
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) { // Only allow image files
            cb(null, true);
        } else {
            cb({ message: "unsupported file format" }, false);
        }
    },
    // Set a limit on the file size (20MB)
    limits: { fileSize: 1024 * 1024 * 20 }
});
