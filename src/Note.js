import React, { PureComponent } from 'react'
import FaPencil from 'react-icons/lib/fa/pencil'
import FaTrash from 'react-icons/lib/fa/trash'
import FaFloppyO from 'react-icons/lib/fa/floppy-o'
import clickDrag from 'react-clickdrag'

class Note extends PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			editing: false,
			isDragging: false,
			lastPositionX: props.xCoord,
            lastPositionY: props.yCoord,
            currentX: props.xCoord,
            currentY: props.yCoord,
			transform: 'rotate(' + props.rotate + 'deg)',
			zIndex: this.props.highestZ()
		}
		
		this.edit = this.edit.bind(this)
		this.remove = this.remove.bind(this)
		this.save = this.save.bind(this)
		this.click = this.click.bind(this)
		this.renderForm = this.renderForm.bind(this)
		this.renderText = this.renderText.bind(this)
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if(nextProps.dataDrag.isMoving) {
			// Update note position and zIndex in Note state while dragging
			return {
				isDragging: true,
				currentX: prevState.lastPositionX + nextProps.dataDrag.moveDeltaX,
				currentY: prevState.lastPositionY + nextProps.dataDrag.moveDeltaY,
				zIndex: nextProps.highestZ()
            }
		} else if(prevState.isDragging) {
			// Run onMove callback when drag is complete, which updates Note position properties
			nextProps.onMove(prevState.currentX, prevState.currentY, nextProps.index)

			return {
				isDragging: false,
                lastPositionX: prevState.currentX,
                lastPositionY: prevState.currentY
            }	
        } else if(prevState.currentX !== nextProps.xCoord || prevState.currentY !== nextProps.yCoord) {
        	// When note position is changed in parent (i.e. change in note props), update state to reflect
           	return {
           		lastPositionX: nextProps.xCoord,
           		lastPositionY: nextProps.yCoord,
        		currentX: nextProps.xCoord,
        		currentY: nextProps.yCoord
        	}
		} else {
			return prevState
		}
	}

	componentDidUpdate() {
		var textArea
		if(this.state.editing) {
			textArea = this._newText
			textArea.focus()
			textArea.select()
		}
	}

	// Allows user to bring note to foreground by cicking on it
	click(e) {
		e.stopPropagation()

		this.setState({
			...this.state,
			zIndex: this.props.highestZ()
		})
	}

	edit(e) {
		e.stopPropagation()

		this.setState({
			editing: true,
			zIndex: this.props.highestZ()
		})
	}

	remove() {
		this.props.onRemove(this.props.index)
	}

	save(e) {
		e.preventDefault()
		
		this.props.onChange(this._newText.value, this.props.index)
		this.setState({
			editing: false
		})
	}

	renderForm(currStyle) {
		return (
			<div className="note" style={currStyle} onClick={(e) => {e.stopPropagation()}}>
				<form onSubmit={this.save}>
					<textarea ref={input => this._newText = input}
							  defaultValue={this.props.children}/>
					<button id="save"><FaFloppyO size="20" /></button>
				</form>
			</div>
		)
	}

	renderText(noteStyle) {
		return (
			<div className="note" style={noteStyle} onClick={this.click}>
				<p>{this.props.children}</p>
				<span>
					<button onClick={this.edit} id="edit"><FaPencil size="20" /></button>
					<button onClick={this.remove} id="remove"><FaTrash size="20" /></button>
				</span>
			</div>
		)
	}

	render() {
		var newStyle = {
			left: this.state.currentX,
			top: this.state.currentY,
			transform: this.state.transform,
			zIndex: this.state.zIndex
		}

		return this.state.editing ? this.renderForm(newStyle) : this.renderText(newStyle)
	}

}

var NoteDrag = clickDrag(Note, {touch: true})

export default NoteDrag