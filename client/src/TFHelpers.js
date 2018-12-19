import * as tf from '@tensorflow/tfjs';

export async function generateTrainData() {

	let canvas = document.createElement('canvas');
	canvas.width = 28*77;
	canvas.height = 28*77;
	let context = canvas.getContext('2d');

	let imgs = {};
	for (let i=0;i<10;i++) {
		let img = new Image();
		img.src = '/img/mnist/mnist'+i+'.jpg';
		imgs[i] = img;
	}
	console.log(imgs);
	let trains = [];
	for (let key in imgs){
		let images = new Uint8Array(28*28*77*77);
		let labels = new Uint8Array(10*77*77);
		let image = imgs[key];
		context.drawImage(image,0,0);//, x * 28, y * 28, 28, 28, 0, 0, canvas.width, canvas.height);
		for(let y = 0; y < 77; ++y) {
			for(let x = 0; x < 77; ++x) {
				let slice = loadCanvas(context.getImageData(x*28,y*28,28,28).data,false);
				let label = new Uint8Array(convertLabel(key));
				images.set(slice,28*28*(77*y+x));
				labels.set(label,10*(77*y+x));
			}
		}
		let tensors = convertToTensors(images,labels);
		trains.push(tensors);
	}
	console.log(trains);
	return trains;
}

export async function runModelTrain(model,images,labels,batchSize) {	
	await model.fit(images, labels, { batchSize });
}
//
//	Converts a Uint8Array of questionable length into an object with 4d and 2d tensors ready for training/evaluating by our model
//
export function convertToTensors(images,labels){
	let total = images.length/(28*28);
	console.log(total);
	let xs = tf.tensor4d(images,[total,28,28,1]);
	let ys = tf.tensor2d(labels,[total,10]);
	return {xs,ys};
}
//
//	Creates our convolutional sequential neural network. No training performed
//
export function createConvModel() {
	// Allows us to build a multilayered, sequential model
	const model = tf.sequential();
	// Adds first layer (input layer) which requires input sizing
	model.add(tf.layers.conv2d({
		inputShape: [28, 28, 1],
		kernelSize: 3,
		filters: 16,
		activation: 'relu'
	}));
	// Adds next few layers; see TFJS for logic on how to best generate this convolutional network
	model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
	model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));
  	model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));
  	model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));
	model.add(tf.layers.flatten({}));
	model.add(tf.layers.dense({units: 64, activation: 'relu'}));
	model.add(tf.layers.dense({units: 10, activation: 'softmax'}));
	// Compiles to test on the metrics that we want
	model.compile({
		optimizer: 'rmsprop',
		loss: 'categoricalCrossentropy',
		metrics: ['accuracy'],
	});
  	return model;
}
//
//	Converts a digit (range 0-9) to a binary array with digit marked. If it errors, caught by function which instantiates it
//
export function convertLabel(pos){
	let raw = [0,0,0,0,0,0,0,0,0,0];
	raw[pos] = 1;
	return raw;
}
//
//	Canvas Loading Function; takes data as flattened rgba array from canvas context and converts to single-pixel binary
//
export function loadCanvas(raw,compress) {
	// 1; Converts typed array to regular array -- courtesy https://stackoverflow.com/a/29862266/10571336
	let data1 = Array.prototype.slice.call(raw);
	// 2; Converts the image to single-value number per pixel (assumption: r,g,b,a are all EQ) -- courtesy https://stackoverflow.com/a/33483070/10571336
	let data2 = data1.filter(function(val,i,Arr) { return i % 4 == 0; })
	// 3; Converts 256/0 to 1/0
	let data3 = data2.map(x => x==0? x : 1);
	// 4; Takes 10x10 chunks of the corresponding image, adds them up, then decides if compressed result is 1/0
	let ret = [];	
	if (compress) {
		let rows = [];
		while (data3.length>0) { rows.push(data3.splice(0,280)); }
		while (rows.length>0) {
		  let strip = rows.splice(0,10);
		  let chunks = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		  for (let j=0;j<10;j++) {
			for (let i=0;i<28;i++) {
			  let seg = strip[j].splice(0,10);
			  let sum = seg.reduce((a,b)=>a+b,0);
			  chunks[i] += sum;			
			}
		  }
		  chunks = chunks.map(x => x>=50? 1:0);
		  ret = ret.concat(chunks);
		}
	} else { ret = data3 };
	// 5; Converts to valid array for tensor
	ret = Uint8Array.from(ret);
	
	return ret;	
}
