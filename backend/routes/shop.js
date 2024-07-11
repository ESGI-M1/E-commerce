const { Router } = require("express");
const router = new Router();
const { Shop } = require("../models");
const checkRole = require("../middlewares/checkRole");
