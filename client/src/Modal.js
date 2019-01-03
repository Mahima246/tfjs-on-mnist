import React from 'react';
var PieChart = require("react-chartjs").Pie;

export default class Modal extends React.Component {

	render(){
		return (
			<div id="modal-wrapper">
				<div id="modal">
					<div className="modal-content">
						<div className="modal-header">
							Results
							<span className="float-right"><p onClick={this.props.toggleClose}>X</p></span>
						</div>
						<div className="row">
							<div className="col">
								<table>
									<tbody>
										{(this.props.pred).map(pred=>(
											<tr>
												<th>{pred.label}</th>
												<td>{pred.value}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="col">
								<PieChart data={this.props.pred} />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

}