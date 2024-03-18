import { Button, Box } from '@material-ui/core';
import './App.css';

function App() {
	return (
		<>
			<Box m={4}>
				<Button variant="contained" color="primary">
					Hello World
				</Button>
			</Box>
			<Box p={3}>
				<div className="bg-red-400 text-blue-200">Hello Tailwind</div>
			</Box>
		</>
	);
}

export default App;
