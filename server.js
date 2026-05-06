const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// ================= MONGODB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// ================= SCHEMA =================
const noteSchema = new mongoose.Schema(
  {
    title: String,
    content: String
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);


// ================= CREATE =================
app.post("/notes", async (req, res) => {
  const note = new Note(req.body);
  await note.save();
  res.json(note);
});


// ================= GET ALL =================
app.get("/notes", async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});


// ================= GET ONE =================
app.get("/notes/:id", async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.json(note);
});


// ================= SEARCH =================
app.get("/search", async (req, res) => {
  const q = req.query.q;

  const notes = await Note.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } }
    ]
  });

  res.json(notes);
});


// ================= UPDATE =================
app.put("/notes/:id", async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "updated" });
});


// ================= DELETE =================
app.delete("/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
});


// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});