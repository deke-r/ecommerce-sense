const express = require("express")
const { verifyToken } = require("../middleware/auth")
const cartAbandonmentService = require("../services/cartAbandonmentService")
const schedulerService = require("../services/schedulerService")

const router = express.Router()

// Get cart abandonment statistics (Admin only)
router.get("/stats", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const stats = await cartAbandonmentService.getAbandonmentStats()
    res.json({ stats })
  } catch (error) {
    console.error("Get abandonment stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Manually trigger cart abandonment check (Admin only)
router.post("/trigger-check", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const processedCount = await schedulerService.triggerCartAbandonmentCheck()
    res.json({ 
      message: "Cart abandonment check triggered successfully",
      processedCount 
    })
  } catch (error) {
    console.error("Trigger abandonment check error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Manually trigger cleanup (Admin only)
router.post("/trigger-cleanup", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const cleanedCount = await schedulerService.triggerCleanup()
    res.json({ 
      message: "Cleanup triggered successfully",
      cleanedCount 
    })
  } catch (error) {
    console.error("Trigger cleanup error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get scheduler status (Admin only)
router.get("/scheduler-status", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const status = schedulerService.getSchedulerStatus()
    res.json({ status })
  } catch (error) {
    console.error("Get scheduler status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Stop specific scheduler (Admin only)
router.post("/stop-scheduler/:name", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const { name } = req.params
    schedulerService.stopScheduler(name)
    res.json({ message: `Scheduler '${name}' stopped successfully` })
  } catch (error) {
    console.error("Stop scheduler error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Stop all schedulers (Admin only)
router.post("/stop-all-schedulers", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    schedulerService.stopAllSchedulers()
    res.json({ message: "All schedulers stopped successfully" })
  } catch (error) {
    console.error("Stop all schedulers error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
