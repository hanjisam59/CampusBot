const express = require('express')
const router = express.Router()
const Notice = require('../models/noticeModel')

// Create a new notice
router.post('/', async (req, res) => {
  try {
    const { heading, date, type, description, pinned } = req.body
    if (!heading || !date || !type) {
      return res.status(400).json({ success: false, message: 'Heading, date, and type are required' })
    }
    const notice = await Notice.create({ heading, date, type, description, pinned })
    res.json({ success: true, notice })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create notice' })
  }
})

// Get all notices
router.get('/', async (req, res) => {
  try {
    const { type } = req.query
    const filter = type && type !== 'All' ? { type } : {}
    const notices = await Notice.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, notices })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch notices' })
  }
})

// Update a notice
router.put('/:id', async (req, res) => {
  try {
    const { heading, date, type, description, pinned } = req.body
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { heading, date, type, description, pinned },
      { new: true }
    )
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' })
    res.json({ success: true, notice })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update notice' })
  }
})

// Delete a notice
router.delete('/:id', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id)
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' })
    res.json({ success: true, message: 'Notice deleted successfully' })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete notice' })
  }
})

module.exports = router
