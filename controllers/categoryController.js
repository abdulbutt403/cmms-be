const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.addCategory = async (req, res) => {
  try {
    console.log('Adding category:', req.body);
    const { name, type } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!type) return res.status(400).json({ success: false, message: 'Type is required' });

    // Check if category with the same name already exists
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });

    // Create new category with name and type
    const category = new Category({ name, type });
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};