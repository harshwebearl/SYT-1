const Document = require("../models/customer_document");

const addDocument = async (req, res) => {
    try {
        const newDocument = new Document({
            customer_id: req.body.customer_id,
            document_type: req.body.document_type,
            document_frontphoto: req.files.document_frontphoto[0].filename,
            document_backphoto: req.files.document_backphoto[0].filename,
            document_issue_date: req.body.document_issue_date,
            document_expiry_date: req.body.document_expiry_date
        });

        const savedDocument = await newDocument.save();
        return res.status(200).json({
            success: true,
            message: "document added successfully",
            data: savedDocument
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
}

const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        document.document_type = req.body.document_type || document.document_type;
        document.document_issue_date = req.body.document_issue_date || document.document_issue_date;
        document.document_expiry_date = req.body.document_expiry_date || document.document_expiry_date;

        if (req.files && req.files.document_frontphoto) {
            document.document_frontphoto = req.files.document_frontphoto[0].filename;
        }
        if (req.files && req.files.document_backphoto) {
            document.document_backphoto = req.files.document_backphoto[0].filename;
        }

        const updatedDocument = await document.save();
        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: updatedDocument
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await Document.findByIdAndDelete(id);
        if (!document) {
            return res.status(404).send({ message: "document not found" });
        }
        return res.status(200).json({
            success: true,
            message: "document deleted successfully",
            data: document
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

module.exports = {
    addDocument,
    updateDocument,
    deleteDocument
}