const { Contact } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

async function createContact(req, res) {
  const { name, email, phoneNumber, subject, message } = req.body;

  const t = await sequelize.transaction();

  try {
    const newContact = await Contact.create(
      {
        name,
        email,
        phoneNumber,
        subject,
        message,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "New Message Via Contact",
      contact: {
        id: newContact.id,
        name: newContact.name,
        email: newContact.email,
        phoneNumber: newContact.phoneNumber,
        subject: newContact.subject,
        message: newContact.message,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Contact Sending Failed :", error);
    res.status(400).json({
      message: "Contact Sending Failed.",
      error: error.message,
    });
  }
}

async function getAllContacts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Contact.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      totalItems: count,
      totalPages,
      currentPage: page,
      contacts: rows,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch contacts.", error: error.message });
  }
}

async function getContactById(req, res) {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found." });
    }

    res.status(200).json({ contact });
  } catch (error) {
    console.error("Error fetching contact by ID:", error);
    res.status(500).json({
      message: "Failed to fetch contact.",
      error: error.message,
    });
  }
}

async function deleteContactById(req, res) {
  try {
    const { id } = req.params;

    const deletedRows = await Contact.destroy({
      where: { id },
    });

    if (deletedRows === 0) {
      return res
        .status(404)
        .json({ message: "Contact message not found to delete." });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact by ID:", error);
    res.status(500).json({
      message: "Failed to delete contact.",
      error: error.message,
    });
  }
}

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  deleteContactById
};
