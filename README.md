# Tensorflow Convolutional Neural Network Testing on User MNIST Digits
(c) 2018 Syd Strzempko (stzuko.github.io)

## Deployment

Access the app at https://tfjs-mnist-predictor.herokuapp.com/

## Libraries Used

* [Tensorflow JS](https://js.tensorflow.org/)
* [Tensorflow for Nodejs](https://github.com/tensorflow/tfjs-node)
* [MNIST images](cs.nyu.edu/~roweis/data.html)
* [Create-react-app](https://github.com/facebook/create-react-app)
* [Canvas](https://www.npmjs.com/package/canvas)
* [React-chartkick](https://github.com/ankane/react-chartkick)

## Description

* Model is pretrained on MNIST data; see `server.js` for associated image manipulation - data is shuffled by iterating over each digit set, sorted into batches and trained

* Model is saved with `save` functionality into `/model` on Express server side

* Upon user input, canvas data gets passed to server as a POST request

* The server loads the saved model and weights, converts the request data to tensors, then runs `predict` on the tensors

* We are using an accuracy metric across 10 output values (coded to each digit class); data returned reflects our network's shape

## Code Referenced

* [Tensorflow.js official tutorial](https://js.tensorflow.org/tutorials/mnist.html)

* [Unofficial tutorial](https://gogul09.github.io/software/digit-recognizer-tf-js)

* [Express with Create-React-App tutorial](https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0)

* [Drawable Canvas](https://enlight.nyc/projects/web-paint/)
