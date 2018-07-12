import React, { Component } from 'react'
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import Note from './Note'

class Board extends Component {
	static propTypes = {
    	cookies: instanceOf(Cookies).isRequired
  	}

	constructor(props) {
		super(props)
		
		this.clickBoard = this.clickBoard.bind(this)
		this.eachNote = this.eachNote.bind(this)
		this.update = this.update.bind(this)
		this.move = this.move.bind(this)
		this.remove = this.remove.bind(this)
		this.nextId = this.nextId.bind(this)
		this.highestZ = () => {
			// Any time highestZ is used for the zIndex of a note,
			// it gets incremented for the next note
			this.highestZindex = this.highestZindex || 0
			return this.highestZindex++
		}

		this.state = {
			notes: []
		}

		const { cookies } = this.props
		// Uncomment to clear cookie, then comment out again:
		// const deleteCookies = cookies.remove('notes')
		const cookieNotes = cookies.get('notes') || [{ id: 0, x: 100, y: 100, rotate: -5, note: 'Sample Note'}]
		cookieNotes.forEach(
			item => {
				this.state.notes.push({
					id: this.nextId(),
					x: this.fitComponent(item.x),
					y: this.fitComponent(item.y, false),
					rotate: item.rotate,
					note: item.note
				})
			})
	}

	// Fit coordinate inside 0 - window-width or 0 - window-height range
	fitComponent(coord, isX = true) {
		let noteSpace = 180
		let inner = isX ? window.innerWidth : window.innerHeight
		let outer = isX ? window.outerWidth : window.outerHeight

		return Math.min(coord, Math.max(0, Math.min(inner, outer) - noteSpace)) 
	}

	// When app loads and window is resized/rotated, 
	// restrict note coordinates to inside window dimensions 
	updateDimensions() {
		this.setState(prevState => ({
			notes: prevState.notes.map(
				note => ({...note, 
					x: this.fitComponent(note.x), 
					y: this.fitComponent(note.y, false)
				})
			)
		}))
	}

	componentDidMount() {
		this.updateDimensions()
		window.addEventListener("resize", this.updateDimensions.bind(this))
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.updateDimensions.bind(this))
	}

	// Save changes made to board into a cookie
	componentDidUpdate() {
		const { cookies } = this.props
		cookies.set('notes', JSON.stringify(this.state.notes), { path: '/', maxAge: 604800 })
	}

	nextId() {
		this.uniqueId = this.uniqueId || 0
		return this.uniqueId++
	}

	randomBetween(x, y) {
		return x + Math.ceil(Math.random() * (y-x))
	}

	// When board gets click, add new note
	clickBoard(e) {
		e.persist()

		this.setState(prevState => ({
			notes: [
				...prevState.notes,
				{
					id: this.nextId(),
					x: this.fitComponent(e.clientX),
					y: this.fitComponent(e.clientY, false),
					rotate: this.randomBetween(-15, 15),
					note: "New Note"
				}
			]
		}))
	}

	update(newText, i) {
		this.setState(prevState => ({
			notes: prevState.notes.map(
				note => (note.id !== i) ? note : {...note, note: newText}
			)
		}))
	}

	move(newX, newY, i) {
		this.setState(prevState => ({
			notes: prevState.notes.map(
				note => (note.id !== i) ? note : {...note, x: newX, y: newY}
			)
		}))
	}

	remove(id) {
		this.setState(prevState => ({
			notes: prevState.notes.filter(note => note.id !== id)
		}))
	}

	eachNote(note, i) {
		return (
			<Note key={note.id}
				  index={note.id}
				  xCoord={note.x}
				  yCoord={note.y}
				  rotate={note.rotate}
				  onChange={this.update}
				  onMove={this.move}
				  onRemove={this.remove}
				  highestZ={this.highestZ}>
				  {note.note}
		    </Note>
		)
	}

	render() {
		return (
			<div className="board" onClick={this.clickBoard}>
				{this.state.notes.map(this.eachNote)}
			</div>
		)
	}
}

export default withCookies(Board)