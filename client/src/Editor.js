import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import { io } from "socket.io-client";

// CONSTANTS
const SAVE_INTERVAL = 2000; // Auto Save to DB time
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
	// state
	const [quill, setQuill] = useState();
	const [socket, setSocket] = useState();

	// Get ID from URL params
	const { documentId } = useParams();

	// On component mount, init the socket client
	useEffect(() => {
		const socketInstace = io("http://localhost:3001");
		setSocket(socketInstace);

		// Reset the socket instance on component unmount
		return () => {
			socketInstace.disconnect();
		};
	}, []);

	useEffect(() => {
		if (socket == null || quill == null) return;

		// load document - needed to do only once
		socket.once("load-document", document => {
			quill.setContents(document);
			quill.enable(); // enable editor
		});

		socket.emit("get-document", documentId); // send document id to the server so it can load
	}, [socket, quill, documentId]);

	// When state of socket or quill is changed, send changes to server
	useEffect(() => {
		if (socket == null || quill == null) return;

		// When any change made in the editor, send the changes to server
		const textChangeHandler = (delta, oldDelta, source) => {
			if (source !== "user") return; // no need to send non-user made changes

			socket.emit("send-changes", delta);
		};
		quill.on("text-change", textChangeHandler);

		// Receive changes from live-share, then update the contents of editor
		const receiveChangesHandler = delta => {
			quill.updateContents(delta);
		};
		socket.on("receive-changes", receiveChangesHandler);

		const periodicSaveDocument = setInterval(() => {
			// Send contents to the server
			socket.emit("save-document", quill.getContents());
		}, SAVE_INTERVAL);

		// Componenet unmount => reset quill, socket
		return () => {
			quill.off("text-change", textChangeHandler);
			socket.off("receive-changes", receiveChangesHandler);
			clearInterval(periodicSaveDocument);
		};
	}, [socket, quill]);

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
