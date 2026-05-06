let editingId = null;

// ================= LOAD NOTES =================
async function loadNotes() {
  try {
    const res = await fetch("/notes");
    const data = await res.json();

    const container = document.getElementById("notes");

    if (data.length === 0) {
      container.innerHTML = `<div class="not-found">No notes available</div>`;
      return;
    }

    container.innerHTML = data.map(n => `
      <div class="card" onclick="openNote('${n._id}')">
        <h2>${n.title || "Untitled"}</h2>
        <span class="date">
          ${new Date(n.createdAt).toDateString()}
        </span>
      </div>
    `).join("");

  } catch (err) {
    console.error("Error loading notes:", err);
  }
}


// ================= OPEN NOTE =================
async function openNote(id) {
  const res = await fetch(`/notes/${id}`);

  if (!res.ok) {
    alert("Note not found");
    return;
  }

  const note = await res.json();

  document.getElementById("editor").classList.remove("hidden");

  document.getElementById("title").value = note.title;
  document.getElementById("content").value = note.content;

  document.getElementById("title").disabled = true;
  document.getElementById("content").disabled = true;

  editingId = id;
}


// ================= ENABLE EDIT =================
function enableEdit() {
  document.getElementById("title").disabled = false;
  document.getElementById("content").disabled = false;
}


// ================= SAVE NOTE =================
async function saveNote() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert("Fill all fields");
    return;
  }

  if (editingId) {
    await fetch(`/notes/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });
  } else {
    await fetch("/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });
  }

  closeEditor();
  loadNotes();
}


// ================= DELETE =================
async function deleteNote() {
  if (!editingId) return;

  await fetch(`/notes/${editingId}`, {
    method: "DELETE"
  });

  closeEditor();
  loadNotes();
}


// ================= NEW NOTE =================
function openEditor() {
  editingId = null;

  document.getElementById("editor").classList.remove("hidden");
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";

  enableEdit();
}


// ================= CLOSE =================
function closeEditor() {
  document.getElementById("editor").classList.add("hidden");
}


// ================= SEARCH =================
async function searchNotes() {
  const q = document.getElementById("search").value.trim();

  if (q === "") {
    loadNotes();
    return;
  }

  const res = await fetch(`/search?q=${q}`);
  const data = await res.json();

  const container = document.getElementById("notes");

  container.innerHTML = data.map(n => `
    <div class="card" onclick="openNote('${n._id}')">
      <h2>${n.title}</h2>
      <span class="date">
        ${new Date(n.createdAt).toDateString()}
      </span>
    </div>
  `).join("");
}


// INIT
loadNotes();