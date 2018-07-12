import React from 'react'
import ReactDOM from 'react-dom'
import { CookiesProvider } from 'react-cookie';

import './index.css'
import Board from './Board'
import { unregister } from './registerServiceWorker'


ReactDOM.render(
	<CookiesProvider>
		<Board />
	</CookiesProvider>,
	document.getElementById('root')
)
unregister()