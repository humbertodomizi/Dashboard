const userService = require("../services/userService");
const { userSchema, formatZodError } = require("../utils/validation");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    // Validate body
    const validatedData = userSchema.parse(req.body);
    const newUser = await userService.createUser(validatedData);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: formatZodError(error) });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    // Partial validation for updates could be different, but using full schema for simplicity or partial
    const validatedData = userSchema.partial().parse(req.body);
    const updatedUser = await userService.updateUser(
      req.params.id,
      validatedData,
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: formatZodError(error) });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
