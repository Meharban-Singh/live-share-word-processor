import { v4 as uuidV4 } from "uuid";

import {
	BrowserRouter as Router,
	Redirect,
	Switch,
	Route,
} from "react-router-dom";

import Editor from "./Editor.js";

function App() {
	return (
		<Router>
			<Switch>
				{/* Match exact url path */}
				<Route path="/" exact>
					{/* Gen random Id for document and then redirect to that id */}
					<Redirect to={`/documents/${uuidV4()}`} />
				</Route>

				{/* Handle route at /documents/:documentId */}
				<Route path="/documents/:documentId">
					<Editor />
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
