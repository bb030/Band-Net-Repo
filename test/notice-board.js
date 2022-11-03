var board = {
  // (A) PROPERTIES
  notes : [],   // current list of notes
  hwrap : null, // html notice board wrapper
  hform: null,  // html add/update note form
  hadd : null,  // html add/update note text field
  hgo : null,   // html add/update note button
  hsel : null,  // current note being dragged or edited

  // (B) INITIALIZE NOTICE BOARD
  init : () => {
    // (B1) GET HTML ELEMENTS
    board.hwrap = document.getElementById("board");
    board.hform = document.getElementById("noteform");
    board.hadd = document.getElementById("notetxt");
    board.hgo = document.getElementById("notego");

    // (B2) LOAD & DRAW HTML NOTES
    let data = localStorage.getItem("notes");
    if (data !== null) { for (let n of JSON.parse(data)) {
      board.draw(n);
    }}

    // (B3) ENABLE ADD NEW NOTE
    board.hform.onsubmit = () => { return board.add(); };
    board.hadd.disabled = false;
    board.hgo.disabled = false;
  },

  // (C) HELPER - CREATE HTML NOTE
  draw : (note, first) => {
    // (C1) CREATE HTML NOTE
    let div = document.createElement("div");
    div.className = "note";
    div.draggable = true;
    div.innerHTML = `<div class="del" onclick="board.del(this.parentElement)">X</div> <div class="txt">${note}</div>`;

    // (C2) ON DRAG START - ADD DROPPABLE HINTS
    div.ondragstart = (e) => {
      board.hsel = e.target;
      for (let n of board.notes) {
        n.classList.add("drag");
        if (n != board.hsel) { n.classList.add("hint"); }
      }
    };

    // (C3) ON DRAG ENTER - HIGHLIGHT DROPZONE
    div.ondragenter = (e) => {
      if (div != board.hsel) { div.classList.add("active"); }
    };

    // (C4) DRAG LEAVE - REMOVE HIGHLIGHT DROPZONE
    div.ondragleave = (e) => {
      div.classList.remove("active");
    };

    // (C5) DRAG END - REMOVE ALL HIGHLIGHTS
    div.ondragend = (e) => { for (let n of board.notes) {
      n.classList.remove("drag");
      n.classList.remove("hint");
      n.classList.remove("active");
    }};

    // (C6) DRAG OVER - PREVENT DEFAULT "DROP", SO WE CAN DO OUR OWN
    div.ondragover = (e) => { e.preventDefault(); };

    // (C7) ON DROP - REORDER NOTES & SAVE
    div.ondrop = (e) => {
      // (C7-1) PREVENT DEFAULT BROWSER DROP ACTION
      e.preventDefault();

      if (e.target != board.hsel) {
        // (C7-2) GET CURRENT & DROPPED POSITIONS
        let idrag = 0, // index of currently dragged
            idrop = 0; // index of dropped location
        for (let i=0; i<board.notes.length; i++) {
          if (board.hsel == board.notes[i]) { idrag = i; }
          if (e.target == board.notes[i]) { idrop = i; }
        }

        // (C7-3) REORDER HTML NOTES
        if (idrag > idrop) {
          board.hwrap.insertBefore(board.hsel, e.target);
        } else {
          board.hwrap.insertBefore(board.hsel, e.target.nextSibling);
        }

        // (C7-4) REORDER & SAVE NOTES ARRAY
        board.save();
      }
    };

    // (C8) DOUBLE CLICK TO EDIT NOTE
    div.ondblclick = () => {
      // (C8-1) SELECTED NOTE
      board.hsel = div.querySelector(".txt");

      // (C8-2) LOCK - NO DRAG NO DELETE WHILE EDITING
      for (let n of board.notes) { n.classList.add("lock"); }

      // (C8-3) UPDATE NOTE FORM
      board.hadd.value = board.hsel.innerHTML;
      board.hgo.value = "Update";
      board.hform.onsubmit = () => { return board.update(); };
      // board.hadd.focus();
      board.hadd.select();
    };

    // (C9) DONE - PUSH INTO ARRAY & ATTACH TO CONTAINER
    if (first) {
      board.notes.unshift(div);
      board.hwrap.insertBefore(div, board.hwrap.firstChild);
    } else {
      board.notes.push(div);
      board.hwrap.appendChild(div);
    }
  },

  // (D) ADD NEW NOTE
  add : () => {
    board.draw(board.hadd.value, true);
    board.hadd.value = "";
    board.save();
    return false;
  },

  // (E) DELETE NOTE
  del : (note) => { if (confirm("Delete note?")) {
    note.remove();
    board.save();
  }},

  // (F) UPDATE NOTE
  update : () => {
    // (F1) UPDATE NOTE
    board.hsel.innerHTML = board.hadd.value;
    board.hadd.value = "";
    board.hgo.value = "Add";

    // (F2) "RESTORE" ADD NOTE FORM
    board.hform.onsubmit = () => { return board.add(); };

    // (F3) SAVE
    board.save();

    // (F4) UNLOCK - ALLOW DRAG & DELETE
    for (let n of board.notes) { n.classList.remove("lock"); }
    return false;
  },

  // (G) UPDATE & SAVE NOTES
  save : () => {
    // (G1) REORDER NOTES ARRAY
    let data = [];
    board.notes = [];
    for (let n of board.hwrap.getElementsByClassName("note")) {
      board.notes.push(n);
      data.push(n.querySelector(".txt").innerHTML);
    }

    // (G2) SAVE DATA
    localStorage.setItem("notes", JSON.stringify(data));
  }
};

window.addEventListener("DOMContentLoaded", board.init);
