const express = require("express");
const router = express.Router();
const multer = require("multer");

const { verifyToken, soloAdmin } = require("../middlewares/auth");
const {
 createInforme,
 getInformes,
 updateInforme,
 deleteInforme
} = require("../controllers/informes.controller");

/* MULTER */
const storage = multer.diskStorage({
 destination:"uploads/",
 filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});
const upload = multer({storage});

router.post("/", verifyToken, upload.array("fotos"), createInforme);
router.get("/", verifyToken, getInformes);
router.put("/:id", verifyToken, updateInforme);
router.delete("/:id", verifyToken, soloAdmin, deleteInforme);

module.exports = router;