import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

function App() {
  const [code, setCode] = useState("print('Hello World')");
  const [output, setOutput] = useState("");
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);

  /* ================= RUN CODE ================= */
  const runCode = async () => {
    setOutput("Running...");

    try {
      const res = await axios.post("http://localhost:5000/run", {
        code,
      });

      setOutput(res.data.output || res.data.error);
    } catch {
      setOutput("Server error");
    }
  };

  /* ================= SAVE CODE ================= */
  const saveCode = async () => {
    if (!name) {
      alert("Enter project name");
      return;
    }

    try {
      await axios.post("http://localhost:5000/save", {
        name,
        code,
      });
      alert("Saved!");
      setName(""); // clear input
    } catch {
      alert("Save failed");
    }
  };

  /* ================= LOAD PROJECTS ================= */
  const loadProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/projects");
      console.log("Projects:", res.data); // debug
      setProjects(res.data);
    } catch {
      alert("Load failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cloud Code Runner</h1>

      {/* ================= EDITOR ================= */}
      <Editor
        height="300px"
        defaultLanguage="python"
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
      />

      {/* ================= INPUT ================= */}
      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginTop: "10px", padding: "5px" }}
      />

      {/* ================= BUTTONS ================= */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={saveCode}>Save</button>
        <button onClick={loadProjects} style={{ marginLeft: "10px" }}>
          Load
        </button>
      </div>

      {/* ================= PROJECT LIST ================= */}
      <ul style={{ marginTop: "10px" }}>
        {projects.map((p, i) => (
          <li
            key={i}
            style={{ cursor: "pointer", margin: "5px 0" }}
            onClick={() => setCode(p.code)}
          >
            {p.name || "Unnamed Project"}
          </li>
        ))}
      </ul>

      {/* ================= RUN BUTTON ================= */}
      <button
        onClick={runCode}
        style={{
          marginTop: "10px",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Run Code
      </button>

      {/* ================= OUTPUT ================= */}
      <pre
        style={{
          marginTop: "20px",
          background: "black",
          color: "lime",
          padding: "10px",
          minHeight: "100px",
        }}
      >
        {output}
      </pre>
    </div>
  );
}

export default App;
