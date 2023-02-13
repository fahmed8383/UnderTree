import express from 'express';

import { AuthUtil } from '../utils/AuthUtil.js';
import { FileUtil } from '../utils/FileUtil.js'

const router = express.Router();

router.use(AuthUtil.authorizeJWT);
// Uncomment when projectName and owner can be passed in with get request
// router.use(AuthUtil.authorizeProjectAccess);

router.route("/compilePDF").post(compilePDF);
router.route("/getPDF").get(getPDF);

async function compilePDF(req, res){
    try {
        await FileUtil.createPDFOutput("output.tex", req.body.text)
        const fileData = FileUtil.getFileData("output.pdf");
        res.json("Successfully compiled PDF");
    }
    catch (err) {
        res.json(err);
    }
}

async function getPDF(req, res) {
    const fileData = FileUtil.getFileData(req.query.file+".pdf");
    res.contentType("application/pdf");
    res.send(fileData);
}

export { router };