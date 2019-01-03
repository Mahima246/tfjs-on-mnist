import React, { Component } from 'react';
import {convertLabel,loadCanvas} from './TFHelpers'

export default class TF extends Component {

	constructor(){
		super();
		this.state = {
			label:null,
			model:null,
			canvas: null,
			c_x0:null,
			c_y0:null,
			c_x1:null,
			c_y1:null,
		}
		this.ctx = React.createRef();
  	}		

	componentDidMount() {
		this.resizectx();
		let context = this.ctx.current.getContext("2d");
		this.setState({canvas: context});
		window.addEventListener('resize',this.resizectx);
	}

	componentDidUpdate(){
		if (this.props.model==null) return;
		if (this.props.model==this.state.model) return;
		this.setState({model:this.props.model});
	}

	resizectx = () => {
		let rect = this.ctx.current.getBoundingClientRect();
        this.setState({c_y0:rect.top,c_x0:rect.left});
	}
		
	setPosition = (e) => { 
		this.setState({c_x1:(e.clientX-this.state.c_x0),c_y1:(e.clientY-this.state.c_y0)}); 
	}

	clearCanvas = () => { this.state.canvas.clearRect(0, 0, 280,280); }

	saveLabel = (e) => {
		try { 
			this.setState({label:convertLabel(e.target.value)});
		} catch {
			this.setState({label:null});
		}
	}
	
	draw = (e) => {
		if (e.buttons !== 1) return;
		this.state.canvas.beginPath();
		this.state.canvas.lineWidth = 30;
		this.state.canvas.lineCap = "round";
		this.state.canvas.strokeStyle = '#ffffff';
		this.state.canvas.moveTo(this.state.c_x1, this.state.c_y1);
		this.setPosition(e);
		this.state.canvas.lineTo(this.state.c_x1, this.state.c_y1);
		this.state.canvas.stroke();
	}
	
	submitData = () => {
		if (this.state.label==null) alert("Please type a valid digit");
		const temp = loadCanvas(this.state.canvas.getImageData(0,0,280,280).data);
	    this.requestModel(temp).then((res)=>{
	    	console.log(res);
	    });
	}

	requestModel = async (req) => {
		const response = await fetch('/model', {
			method: 'POST',
			headers: {
		        'Content-Type': 'application/json',
		    },
			body: JSON.stringify({ xs: req })
			});
		const body = await response.text();
		return body;
	}

  render() {
    return (
		<div className='container elegant-color-dark'>
			<div className="row">
				<div className="col text-center">
					<h1>Digit Predictor</h1>
				</div>
			</div>
			<div className="row">
				<div className="col text-center">				
					<canvas 
						id="drawable"
						width={280} height={280} 
						ref={this.ctx} 
						onMouseMove={this.draw}
						onMouseDown={this.setPosition}
						onMouseEnter={this.setPosition}
					></canvas>
				</div>
			</div>
			<div className="row">
				<div className="col text-center">
					<input type="text" onChange={this.saveLabel} />
					<button onClick={this.clearCanvas}>Clear</button>
					<button onClick={this.submitData}>Submit</button>
				</div>
			</div>
			<div className="row">
			</div>
		</div>
    );
  }
}
