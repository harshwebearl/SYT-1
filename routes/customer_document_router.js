const { addDocument, updateDocument, deleteDocument } = require('../controllers/customer_document_controller');

const router = require('express').Router();


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/document"); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, (Date.now() + file.originalname).replace(/\s+/g, "")); // Set a unique filename for the uploaded file
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
            return cb(new Error("Please upload a valid image file"));
        }
        cb(null, true);
    }
});



module.exports = upload;


router.post('/addDocument', upload.fields([{ name: 'document_frontphoto', maxCount: 1 }, { name: 'document_backphoto', maxCount: 1 }]), addDocument)
router.put('/updateDocument/:id', upload.fields([{ name: 'document_frontphoto', maxCount: 1 }, { name: 'document_backphoto', maxCount: 1 }]), updateDocument)
router.delete('/deleteDocument/:id', deleteDocument);

module.exports = router;