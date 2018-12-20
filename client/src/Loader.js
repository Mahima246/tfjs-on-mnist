import React from 'react';
import { generateTrainData, runModelTrain } from './TFHelpers'


export default class Loader extends React.Component {
        constructor(){
			super();
			this.state = {
				loading_message: null,
				ready_button: null,
			}
		}

		routeToTF = e => {
			e.preventDefault();
			this.props.history.push(`/tf`);
		}

		loadTF = e => {
			e.preventDefault();
			alert("Will take a while to train!");
			generateTrainData().then((ret)=>{
                let msg = "Data loaded! Please click to run training";
               	let button = (<button className="ready_button" type="submit" onClick={this.trainTF}>Train Model</button>);
               	this.setState({loading_message:msg,ready_button:button,tensors:ret});
            });
		}

		trainTF = e => {
			e.preventDefault();
			let model = this.props.model;
			for (let tensor of this.state.tensors){
				runModelTrain(model,tensor.xs,tensor.ys,(77*77)).then((newmodel)=>{
					model = newmodel;
					console.log("trained 1");
				});
			}		
			this.props.sendModel(model);
			let msg = "Model trained! Please click to navigate to testing page";
			let button = (<button className="ready_button" type="submit" onClick={this.routeToTF}>Go To Testing</button>);
			this.setState({loading_message:msg,ready_button:button});			
		}

		componentDidMount = () => {
			let loading = "Please click to load MNIST dataset";
			let button = (<button className="ready_button" type="submit" onClick={this.loadTF}>Load Dataset</button>);
			this.setState({loading_message:loading,ready_button:button});
		}

		render() {
                return (
                        <div className="container elegant-color-dark" id="Loader">
							<div className="col text-center">
								<h3 className="loading_message">{this.state.loading_message}</h3>
								<br />
								{this.state.ready_button}	
							</div>						
						</div>
                );
        }
}

