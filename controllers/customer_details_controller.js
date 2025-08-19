const Customer = require("../models/customer_details");
const mongoose = require('mongoose');
const userSchema = require("../models/usersSchema");
const fn = "customer";
const image_url = require("../update_url_path.js");


// const addCustomer = async (req, res) => {
//     try {
//         const { fullName, mobile, email, country, state, city, pincode, address, agency_id } = req.body;

//         const files = req.files;
//         const customerPhoto = files.find(file => file.fieldname === 'customerPhoto')?.filename;

//         if (!customerPhoto) {
//             return res.status(400).send({ error: 'Customer photo is required' });
//         }

//         const documentCount = req.body.document.length;

//         const documents = [];
//         for (let i = 0; i < documentCount; i++) {
//             const documentFrontPhoto = files.find(file => file.fieldname === `document_frontphoto[${i}]`)?.filename;
//             const documentBackPhoto = files.find(file => file.fieldname === `document_backphoto[${i}]`)?.filename;


//             const documentType = req.body.document[i].document_type;
//             const documentIssueDate = req.body.document[i].document_issue_date;
//             const documentExpiryDate = req.body.document[i].document_expiry_date

//             if (!documentFrontPhoto || !documentBackPhoto) {
//                 return res.status(400).send({ error: `Document photos are required for document set ${i}` });
//             }

//             documents.push({
//                 document_type: documentType,
//                 document_frontphoto: documentFrontPhoto,
//                 document_backphoto: documentBackPhoto,
//                 document_issue_date: documentIssueDate,
//                 document_expiry_date: documentExpiryDate
//             });
//         }

//         const customer = new Customer({
//             fullName,
//             mobile,
//             email,
//             country,
//             state,
//             city,
//             pincode,
//             address,
//             document: documents,
//             customerPhoto,
//             agency_id
//         });

//         await customer.save();
//         return res.status(201).send(customer);
//     } catch (error) {
//         return res.status(500).send({ error: error.message });
//     }
// };

// const updateCustomer = async (req, res) => {
//     try {
//         const customerId = req.params.id; // Assuming customer ID is passed as a route parameter
//         const { fullName, mobile, email, country, state, city, pincode, address, agency_id } = req.body;

//         const files = req.files;
//         const customerPhoto = files.find(file => file.fieldname === 'customerPhoto')?.filename;

//         // Fetch existing customer data
//         let customer = await Customer.findById(customerId);
//         if (!customer) {
//             return res.status(404).send({ error: 'Customer not found' });
//         }

//         // Update customer fields if provided
//         if (fullName) customer.fullName = fullName;
//         if (mobile) customer.mobile = mobile;
//         if (email) customer.email = email;
//         if (country) customer.country = country;
//         if (state) customer.state = state;
//         if (city) customer.city = city;
//         if (pincode) customer.pincode = pincode;
//         if (address) customer.address = address;
//         if (agency_id) customer.agency_id = agency_id;


//         let documentDetails = customer.document

//         console.log("documentFind : ", customer.document)
//         // Handle document updates if provided
//         // console.log(req.body)

//         if (req.body.document && Array.isArray(req.body.document)) {
//             const documentCount = req.body.document.length;

//             for (let i = 0; i < documentCount; i++) {
//                 const documentType = req.body.document[i].document_type;
//                 const documentIssueDate = req.body.document[i].document_issue_date;
//                 const documentExpiryDate = req.body.document[i].document_expiry_date;
//                 // const documentFrontPhoto = files.find(file => file.fieldname === `document_frontphoto[${i}]`)?.filename;
//                 // const documentBackPhoto = files.find(file => file.fieldname === `document_backphoto[${i}]`)?.filename;

//                 // Ensure the customer document array has the necessary index
//                 if (!customer.document[i]) {
//                     customer.document[i] = {};
//                 }

//                 // Find existing document by index
//                 let existingDocument = customer.document[i];

//                 // Update document details if provided
//                 if (documentType) existingDocument.document_type = documentType;
//                 if (documentIssueDate) existingDocument.document_issue_date = documentIssueDate;
//                 if (documentExpiryDate) existingDocument.document_expiry_date = documentExpiryDate;
//                 // if (documentFrontPhoto) existingDocument.document_frontphoto = documentFrontPhoto;
//                 // if (documentBackPhoto) existingDocument.document_backphoto = documentBackPhoto;
//             }
//         }
//         if(req.files && Array.isArray(req.files)){
//             const imageCount = req.files.length;
//             const doc = req.files;

//             for(let i=0; i<imageCount; i++){
//                 const image = doc[i];

//                 const photoType = image.fieldname.slice(0,-3);
//                 const index = parseInt(image.fieldname.slice(-2,-1));

//                 console.log(index)
//                 // let existingDocument = customer.document[i];

//                 // if(photoType="document_frontphoto") documentFrontPhoto= image;

//                 // if (documentFrontPhoto) existingDocument.document_frontphoto = documentFrontPhoto;
//                 // if (documentBackPhoto) existingDocument.document_backphoto = documentBackPhoto;


//             }
//         }
//         // console.log(req.files)



//         // Update customer photo if provided
//         if (customerPhoto) customer.customerPhoto = customerPhoto;

//         // Save updated customer data
//         await customer.save();

//         return res.status(200).send(customer);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({ error: error.message });
//     }
// };

const addCustomer = async (req, res) => {
    try {
        console.log('req_body:', req.body)
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }

        const newCustomer = new Customer({
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            email: req.body.email,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            address: req.body.address,
            customerPhoto: req.file.filename,
            agency_id: tokenData.id
        });

        const savedCustomer = await newCustomer.save();
        res.status(200).json({
            success: true,
            message: "customer add successfully",
            data: savedCustomer
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const updateCustomer = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }

        const { id } = req.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).send({ message: "Customer not found" });
        }

        const { fullName, mobile, email, country, state, city, pincode, address, agency_id } = req.body;
        const updateData = {
            fullName: fullName || customer.fullName,
            mobile: mobile || customer.mobile,
            email: email || customer.email,
            country: country || customer.country,
            state: state || customer.state,
            city: city || customer.city,
            pincode: pincode || customer.pincode,
            address: address || customer.address,
            // agency_id: agency_id || customer.agency_id,
        };

        if (req.file) {
            updateData.customerPhoto = req.file.filename;
        }

        const updatedData = await Customer.findByIdAndUpdate(id, updateData, { new: true });
        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: updatedData
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

const deleteCustomer = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }

        const { id } = req.params;
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) {
            return res.status(404).send({ message: "customer not found" });
        }
        return res.status(200).json({
            success: true,
            message: "customer deleted successfully",
            data: customer
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


const getCustomerById = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }
        const { id } = req.params;

        const customer = await Customer.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'customer_documents',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'customer_documents'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'agency_id',
                    foreignField: '_id',
                    as: 'agency_details',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'agencypersonals',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'agency_personal_details'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                role: 1,
                                'agency_personal_details.agency_name': 1
                            }
                        }
                    ]
                }
            }
        ]);


        if (customer.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        for (let i = 0; i < customer.length; i++) {
            customer[i].customerPhoto = await image_url(fn, customer[i].customerPhoto);
        }

        for (let i = 0; i < customer.length; i++) {
            for (let j = 0; j < customer[i].customer_documents.length; j++) {
                customer[i].customer_documents[j].document_frontphoto = await image_url('document', customer[i].customer_documents[j].document_frontphoto);
                customer[i].customer_documents[j].document_backphoto = await image_url('document', customer[i].customer_documents[j].document_backphoto);
            }
        }

        return res.status(200).json({
            success: true,
            message: "customer retrived successfully",
            data: customer
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllCustomer = async (req, res) => {
    try {

        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userSchema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }
        const customers = await Customer.aggregate([
            {
                $lookup: {
                    from: 'customer_documents',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'customer_documents'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'agency_id',
                    foreignField: '_id',
                    as: 'agency_details',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'agencypersonals',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'agency_personal_details'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                role: 1,
                                'agency_personal_details.agency_name': 1
                            }
                        }
                    ]
                }
            }
        ]);

        if (customers.length === 0) {
            return res.status(404).json({ message: "Customers not found" });
        }

        for (let i = 0; i < customers.length; i++) {
            customers[i].customerPhoto = await image_url(fn, customers[i].customerPhoto);
        }

        for (let i = 0; i < customers.length; i++) {
            for (let j = 0; j < customers[i].customer_documents.length; j++) {
                customers[i].customer_documents[j].document_frontphoto = await image_url('document', customers[i].customer_documents[j].document_frontphoto);
                customers[i].customer_documents[j].document_backphoto = await image_url('document', customers[i].customer_documents[j].document_backphoto);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Customers retrieved successfully",
            data: customers
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports = {
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getAllCustomer
};
