
const express = require('express');
const Category = require('../models/Category');
const router = express.Router();




router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const categories = await Category.findOne(req.params.id);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category removed', category });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/:categoryId/items', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.items.push(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/:categoryId/items', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
      
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:categoryId/items/:itemId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Filter out the item with the matching id
        category.items = category.items.filter(
            (item) => item.id.toString() !== req.params.itemId
        );
        await category.save();
        res.json({ message: 'Item removed', category });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:categoryId/items/:itemId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const item = category.items.find(
            (item) => item.id.toString() === req.params.itemId
        );
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.set(req.body);
        await category.save();
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:categoryId/items/:itemId', async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const item = category.items.find(
            (item) => item.id.toString() === req.params.itemId
        );
        
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
