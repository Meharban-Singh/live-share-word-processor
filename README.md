# live-share-word-processor

Word processor with live sharing. Server in Node.js,  client in React.js and DB in MongoDB Atlas. Uses Socket.io for live sharing. 

### Features
1. Basic text editor to edit documents - colors, lists, headings, bold, italic, underline, alignment, fonts, subscript, superscript etc. 
2. Each document has a document ID which can be used to open many instances of the document which are then updated live on each instance as the changes are made on any instance. 
3. Persistence: Documents are persisted in a mongoDB. 

### MongoDB setup
Add a `.env` file to the `/server` folder with the mongo DB username, password, cluster name. Sample .env: 
```
MONGO_DB_CLUSTER_NAME=<cluster name here>
MONGO_DB_USER_NAME=<user name here>
MONGO_DB_USER_PASSWORD=<password here>
```
