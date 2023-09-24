import { useState } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("notes");
  const [version, setVersion] = useState("1");
  const [img, setImg] = useState("");
  let db = null;

  function viewImages() {
    const tx = db.transaction("personal_notes", "readwrite");
    const pNotes = tx.objectStore("personal_notes");
    const request = pNotes.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        // console.log({ img: cursor.value.image });
        var URL = window.URL || window.webkitURL;
        // Create and revoke ObjectURL
        var imgURL = URL.createObjectURL(cursor.value.image);
        setImg(imgURL);

        cursor.continue();
      }
    };
  }

  function viewNote() {
    const tx = db.transaction("personal_notes", "readonly");
    const pNotes = tx.objectStore("personal_notes");
    const request = pNotes.openCursor();
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        alert(`Title: ${cursor.key} Text: ${cursor.value.text}`);
        cursor.continue();
      }
    };
  }

  async function addNote() {
    let data = await fetch("http://localhost:5173/default.png");
    // console.log({ data: await data.blob() });
    const note = {
      title: "note" + Math.random(),
      text: "This is my note baby",
      image: await data.blob(),
    };
    const tx = db.transaction("personal_notes", "readwrite");
    tx.onerror = (e) => alert(`error! ${e.target.error}`);
    const pNotes = tx.objectStore("personal_notes");
    pNotes.add(note);
  }

  function createDB(name, version) {
    const request = indexedDB.open(name, version);
    console.log({ request });

    request.onupgradeneeded = (e) => {
      db = e.target.result;

      const personalNotes = db.createObjectStore("personal_notes", {
        keyPath: "title",
      });
      const todoNotes = db.createObjectStore("todo_notes", {
        keyPath: "title",
      });

      alert(`upgraded db name: ${db.name}`);
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      alert(`success db name: ${db.name}`);
    };

    request.onerror = (e) => {
      alert(`error! ${e.target.error}`);
    };
  }

  return (
    <>
    <div>

    <img src={img} alt="" />
    </div>
      <div>
        name:{" "}
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          id="name"
        />
        version:{" "}
        <input
          type="text"
          onChange={(e) => setVersion(e.target.value)}
          id="version"
        />
        <button value="submit" onClick={() => createDB(name, version)}>
          submit
        </button>
        <button value="submit" onClick={() => addNote()}>
          add note
        </button>
        <button value="submit" onClick={() => viewNote()}>
          view note
        </button>
        <button value="submit" onClick={() => viewImages()}>
          view image
        </button>
      </div>
    </>
  );
}

export default App;
