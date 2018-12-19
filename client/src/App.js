import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loader from './Loader'
import TF from './TF'
import { createConvModel, runModelTrain } from './TFHelpers'

export default class App extends React.Component {
	
	constructor(){
		super();
		this.state = {
			model: null,
			train: null,
		}
	}	

	componentDidMount(){
		console.log("App mounted");
		// Prepare the model
		let model = createConvModel();
		this.setState({model:model});
	}

	sendModel = (m) => {
		this.setState({model:m});
	}

	render() {
		return (
			<Switch>
				<Route exact path='/' render={props => <Loader model={this.state.model} sendModel={this.sendModel} />} />
				<Route exact path='/tf' render={props => <TF model={this.state.model} />} />
			</Switch>
		);
	}
}
		
