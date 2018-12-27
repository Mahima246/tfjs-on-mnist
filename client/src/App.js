import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Loader from './Loader'
import TF from './TF'
import { createConvModel, runModelTrain } from './TFHelpers'
import * as tf from '@tensorflow/tfjs';
export default class App extends React.Component {
	
	constructor(){
		super();
		this.state = {
			model: null,
			test: null,
		}
	}	

	componentDidMount(){
		// Prepare the model
		this.requestModel().then((model)=>{
			this.setState({model:model});
		});
	}

	requestModel = async () => {
		let model = await tf.loadModel('http://localhost:3000/model/model.json','http://localhost:3000/model/weights.bin');
		return model;
	}

	render() {
		return (
			<Switch>
				<Route exact path='/' render={props => <TF model={this.state.model} />} />
			</Switch>
		);
	}
}
		
