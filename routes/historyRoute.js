import { Router } from "express";
import { photoUpload } from "../middlewares/photoUpload.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import validateObject from "../middlewares/validateObject.js";
import { createHistory, deleteHistory, getAllHistory, getHistoryCount, getSingleHistory, updateHistory, updateHistoryPhoto } from "../controllers/historyController.js";

const router = new Router()

router.route("/")
    .post(verifyToken, photoUpload.single("image"), createHistory)
    .get(getAllHistory)

router.route("/count").get(getHistoryCount)

router.route("/:id")
    .get(validateObject, getSingleHistory)
    .delete(validateObject, verifyToken, deleteHistory)
    .put(validateObject, verifyToken, updateHistory)

router.route("/update-image/:id")
    .put(validateObject, verifyToken, photoUpload.single("image"), updateHistoryPhoto)


export default router