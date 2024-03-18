import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.tsx';
import './index.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/index.ts';
import { ThemeProvider } from '@material-ui/core';
import theme from './theme.ts';

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<I18nextProvider i18n={i18n}>
				<App />
			</I18nextProvider>
		</ThemeProvider>
	</React.StrictMode>,
	document.getElementById('root')!,
);
