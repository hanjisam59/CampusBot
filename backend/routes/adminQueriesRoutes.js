const express = require('express')
const router = express.Router()
const Query = require('../models/queryModel')

// List all queries (optionally filter by status)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const items = await Query.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, items })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch queries' })
  }
})

// Get published responses for Latest Updates
router.get('/published', async (req, res) => {
  try {
    const items = await Query.find({ published: true, status: 'resolved' }).sort({ updatedAt: -1 }).limit(10)
    res.json({ success: true, items })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch published responses' })
  }
})

// Resolve a query and store admin response
router.post('/:id/resolve', async (req, res) => {
  try {
    const { response } = req.body || {}
    if (!response || !response.trim()) {
      return res.status(400).json({ success: false, message: 'Response is required' })
    }
    const item = await Query.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', response: response.trim(), published: true },
      { new: true }
    )
    if (!item) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, item })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to resolve query' })
  }
})

module.exports = router


