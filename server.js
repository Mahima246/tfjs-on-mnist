const tf = require('@tensorflow/tfjs');
// CPU computation
require('@tensorflow/tfjs-node');
//const fs = require('file-system');
const { createCanvas, loadImage } = require('canvas');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.static('data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function buildModel(){
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

async function prepTrains() {
	const trains = [];
    	const canvas = createCanvas(28*77,28*77);
	const context = canvas.getContext('2d');
	let imgs = [];
	return new Promise(function(res,rej){
		for (let i=0;i<10;i++) {
			let path = 'http://localhost:5000/mnist'+i+'.jpg';
			loadImage(path).then((img) => { if (sliceupImage(img,i)) res(trains);})
					.catch((err)=>{console.log("failed");});
		}
	});
	function sliceupImage(image,key){
        	let images = new Uint8Array(28*28*77*77);
        	let labels = new Uint8Array(10*77*77);
		console.log("drawimg");
 		context.drawImage(image,0,0);
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
		return trains.length==10? true : false;
	}
	function convertLabel(pos){
		let raw = [0,0,0,0,0,0,0,0,0,0];
        	raw[pos] = 1;
        	return raw;
	}
	function convertToTensors(images,labels){
		let total = images.length/(28*28);
        	console.log(total);
        	let xs = tf.tensor4d(images,[total,28,28,1]);
        	let ys = tf.tensor2d(labels,[total,10]);
        	return {xs,ys};
	}
}
function loadCanvas(raw,compress) {
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

async function trainModel(model,data){
	return new Promise(function(res,rej){
		for (let tensor in data){
			console.log(tensor.xs);
			console.log(tensor.ys);
			let fpromise = model.fit(tensor.xs,tensor.ys);
			fpromise.then(()=>{console.log("fitted");});
		}
		res(model);
	});
}

async function run(){
	return new Promise(function(res,rej){
		const empty = buildModel();
		let tpromise = prepTrains();
		tpromise.then((ret)=>{
			let mpromise = trainModel(empty,ret);
			mpromise.then((model)=>{
				res(model);
			}).catch((err)=>{rej(err)});
		}).catch((err)=>{rej(err)});
	});
}

let rpromise = run();
rpromise.then((model)=>{const modelx=model;});

app.get('/model', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
