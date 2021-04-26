import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import { io } from "socket.io-client";

// CONSTANTS
const SAVE_INTERVAL_MS = 2000; // Auto Save to DB time
const TOOLBAR_OPTIONS = [
	["bold", "italic", "underline", "strike"], // toggled buttons
	["blockquote", "code-block"],

	[{ header: 1 }, { header: 2 }], // custom button values
	[{ list: "ordered" }, { list: "bullet" }],
	[{ script: "sub" }, { script: "super" }], // superscript/subscript
	[{ indent: "-1" }, { indent: "+1" }], // outdent/indent
	[{ direction: "rtl" }], // text direction

	[{ size: ["small", false, "large", "huge"] }], // custom dropdown
	[{ header: [1, 2, 3, 4, 5, 6, false] }],

	[{ color: [] }, { background: [] }], // dropdown with defaults from theme
	[{ font: [] }],
	[{ align: [] }],

	["clean"], // remove formatting button
];

export default function Editor() {
	const [quill, setQuill] = useState();

	// Init Editor
	const editorRef = useCallback(container => {
		// No need to proceed if param is missing
		if (container == null) return;

		// Page reset ==> remove text from editor
		container.innerHTML = "";

		// Add editor div to the container
		const editor = document.createElement("div");
		container.append(editor);

		// Create Text editor in the container
		const quillInstance = new Quill(editor, {
			theme: "snow",
			modules: { toolbar: TOOLBAR_OPTIONS }, // toolbar options
		});

		// Disable the editor so that it cannot be used until it loads
		quillInstance.disable();
		quillInstance.setText("Loading...");

		// Add Quill to state so others can access Quill.
		setQuill(quillInstance);
	}, []);

	return <div className="editor" ref={editorRef}></div>;
}
