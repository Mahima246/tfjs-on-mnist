import React from 'react';
import ReactChartkick, { PieChart } from 'react-chartkick'
import Chart from 'chart.js'
ReactChartkick.addAdapter(Chart)

export default class Modal extends React.Component {

	chopDigits = (raw) => {
		return raw>.1? raw.toPrecision(5) : Number.parseFloat(raw.toPrecision(3)).toExponential();
	}

	convertChart = (raw) => {
		console.log(raw.map(single=>{return [single.label,single.value]}))
		return raw.length>0? raw.map(single=>{return [single.label,single.value]}) : raw;
	}

	render(){
		return (
			<div id="modal-wrapper">
				<div id="modal">
					<div className="col">
						<h2>Best Guess: {this.props.pred.length>0? this.props.pred[0].label: "None"}</h2>
						<hr />
					</div>
					<div className="col flex">
						<table>
							<thead>
								<th>Guess</th>
								<td>Accuracy</td>
							</thead>
							<tbody>
								{(this.props.pred).map(pred=>(
									<tr>
										<th>{pred.label}</th>
										<td>{this.chopDigits(pred.value)}%</td>
									</tr>
								))}
							</tbody>
						</table>
						<PieChart data={this.convertChart(this.props.pred)} />
					</div>
					<div className="col">
						<button className="exit-button" onClick={this.props.toggleClose}>X</button>
					</div>
				</div>
			</div>
		)
	}

}