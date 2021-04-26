const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
require("dotenv").config();

const mongo = {
	USER: process.env.MONGO_DB_USER_NAME,
	PASSWORD: process.env.MONGO_DB_USER_PASSWORD,
	CLUSTER: process.env.MONGO_DB_CLUSTER_NAME,
	DATABASE: "Document",
};
const MONGO_DB_CONNECTION_URL = `mongodb+srv://${mongo.USER}:${mongo.PASSWORD}@${mongo.CLUSTER}.0znkf.mongodb.net/${mongo.DATABASE}?retryWrites=true&w=majority`;

// Model from DB
const Document = model(
	"Document",
	new Schema({
		_id: String,
		data: Object,
	})
);

// Connect to MongoDB
mongoose.connect(MONGO_DB_CONNECTION_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true,
});

// Create socket instance
const io = require("socket.io")(3001, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

/**
 * Returns the document if exists, else creates a new doc
 *
 * @param {string} id DocumentID
 * @returns Promise
 */
async function findOrCreateDocument(id) {
	if (id == null) return; // Id check

	const document = await Document.findById(id);

	// If doc exists, return i
	if (document) return document;

	// Create a new Doc in the mongo DB
	return await Document.create({ _id: id, data: "" });
}

// Connect to the socket
io.on("connection", socket => {
	// First request would be to get-document
	socket.on("get-document", async documentId => {
		// Get Doc
		const document = await findOrCreateDocument(documentId);

		// Join the doc room so that only this ID's contents are live-shared, not affecting other ids
		socket.join(documentId);

		// Send the document's data to client
		socket.emit("load-document", document.data);

		// When new changes are made, broadcast them to the ID socket room
		socket.on("send-changes", delta => {
			socket.broadcast.to(documentId).emit("receive-changes", delta);
		});

		// Save doc to DB
		socket.on("save-document", async data => {
			await Document.findByIdAndUpdate(documentId, { data });
		});
	});
});

console.log("SERVER STARTED");
