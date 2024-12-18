const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/jwtAuth");
const { checkRole } = require("../middleware/auth");

// 管理员专属页面
router.get("/admin/dashboard", authenticateJWT, checkRole("admin"), (req, res) => {
    res.json({ message: "欢迎来到管理员面板！" });
});

module.exports = router;