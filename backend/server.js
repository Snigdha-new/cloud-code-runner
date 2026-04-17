const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ================== MONGODB CONNECTION ================== */

mongoose.connect("mongodb://madirajuis23_db_user:1996S2005@ac-gjon4eh-shard-00-00.c51cmha.mongodb.net:27017,ac-gjon4eh-shard-00-01.c51cmha.mongodb.net:27017,ac-gjon4eh-shard-00-02.c51cmha.mongodb.net:27017/codeRunner?ssl=true&replicaSet=atlas-srkqtw-shard-0&authSource=admin&retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ================== SCHEMA ================== */

const Project = mongoose.model("Project", {
  name: String,
  code: String,
});

/* ================== ROUTES ================== */

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ---------- RUN CODE ---------- */
app.post("/run", (req, res) => {
  console.log("Request received");

  const code = req.body.code;

  const filePath = path.join(__dirname, "temp.py");

  fs.writeFileSync(filePath, code);

  let dir = __dirname.replace(/\\/g, "/");
  dir = dir.replace(/^([A-Z]):/, (match, p1) => `/${p1.toLowerCase()}`);

  const command = `docker run --rm -v ${dir}:/app -w /app python:3.11-alpine python temp.py`;

  exec(command, (error, stdout, stderr) => {
    try {
      fs.unlinkSync(filePath);
    } catch {}

    if (error) {
      return res.json({
        error: stderr || "Execution error",
      });
    }

    res.json({
      output: stdout || stderr || "No output",
    });
  });
});

/* ---------- SAVE PROJECT ---------- */
app.post("/save", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.json({ error: "Project name required" });
    }

    const project = new Project({ name, code });
    await project.save();

    res.json({ message: "Saved successfully" });
  } catch (err) {
    console.log(err);
    res.json({ error: "Save failed" });
  }
});

/* ---------- GET PROJECTS ---------- */
app.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

/* ================== SERVER ================== */

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});