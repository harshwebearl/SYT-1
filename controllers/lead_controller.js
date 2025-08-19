const mongoose = require("mongoose");
const Lead = require("../models/Lead.model");
const userschema = require("../models/usersSchema");


const addLead = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userschema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }

        const { mobile, whatsappNum, Name, service, Source, StaffName, nextFollowUp, status, detail_discussion } = req.body;

        if (!mobile || !whatsappNum || !Name || !service || !Source || !StaffName || !nextFollowUp) {
            return res.status(400).send({ message: "All fields are required" });
        }

        const newLead = await Lead.create({
            mobile,
            whatsappNum,
            Name,
            service,
            Source,
            StaffName,
            nextFollowUp,
            status,
            agency_id: tokenData.id,
            detail_discussion
        });

        return res.status(200).json({
            message: "Lead added successfully",
            Lead: newLead
        });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const deleteLead = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userschema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }
        const { id } = req.params
        const lead = await Lead.findByIdAndDelete(id);
        if (!lead) {
            return res.status(404).send({ message: "Lead not found" });
        }
        return res.status(200).json({
            message: "lead deleted successfully",
            lead: lead
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const updateLead = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userschema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }
        const { mobile, whatsappNum, Name, service, Source, StaffName, nextFollowUp, detail_discussion, status } = req.body;
        const { id } = req.params;

        const lead = await Lead.findById(id)
        if (!lead) {
            return res.status(404).send({ message: "lead not found" });
        }

        const updateData = {
            mobile,
            whatsappNum,
            Name,
            service,
            Source,
            StaffName,
            nextFollowUp,
            detail_discussion,
            status
        }

        const updatedData = await Lead.findByIdAndUpdate(id, updateData, { new: true })

        return res.status(200).json({
            message: "Lead updated successfully",
            lead: updatedData
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const getAllLead = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userschema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }
        const leads = await Lead.aggregate([
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
        if (!leads) {
            return res.status(404).send({ message: "Lead not found" });
        }
        return res.status(200).json({
            message: "Lead retrived successfully",
            length: leads.length,
            leads: leads
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

const getDetailsLead = async (req, res) => {
    try {
        const tokenData = req.userData;
        if (tokenData === "") {
            return res.status(401).json({
                message: "Auth fail"
            });
        }
        const userData = await userschema.find({ _id: tokenData.id });
        if (userData[0].role !== "agency") {
            throw new Forbidden("you are not agency");
        }

        let leadId = req.query.leadId
        const leads = await Lead.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(leadId) }
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
        if (!leads) {
            return res.status(404).send({ message: "Lead not found" });
        }
        return res.status(200).json({
            message: "Lead retrived successfully",
            length: leads.length,
            leads: leads
        })
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

module.exports = {
    addLead,
    deleteLead,
    updateLead,
    getAllLead,
    getDetailsLead
}