const tf = require('@tensorflow/tfjs');
const path = require("path");
// CPU computation
require('@tensorflow/tfjs-node');
//const fs = require('file-system');
const { createCanvas, loadImage } = require('canvas');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.post('/model', (req, res) => {
    
    let mpromise = loadModel();
    mpromise.then((model)=>{
        let temp = Uint8Array.from(req.body.xs);
        let test = convertToTensors(temp,[0,0,0,0,0,0,0,0,1,0]);
        let ret = Array.from(model.predict(test.xs).dataSync());
        res.send({acc:ret});

    });

});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));


// Helper functions --------------------------------------------

// Train and save the model (executed before deployment)
// let rpromise = run();
// rpromise.then((model)=>{
//  model.save('file://./model');
//  console.log("Done");
// });

// Reloads model from local files
async function loadModel(){
    return new Promise(async function(res,rej){
        let newmodel = await tf.loadModel('file://./model/model.json','file://./model/weights.bin')
        res(newmodel);
    })
}

// Generates a sequential, mulit-layered model
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

// Loads and preprocesses our training images
async function prepTrains() {
    const trains = [];
    const canvas = createCanvas(28*77,28*77);
    const context = canvas.getContext('2d');
    let imgs = [];
    return new Promise(function(res,rej){
        for (let i=0;i<10;i++) {
            let path = 'http://localhost:5000/data/mnist'+i+'.jpg';
            //let path = '/data/mnist'+i+'.jpg';
            loadImage(path).then((img) => {
                //console.log("worked")
                if (sliceupImage(img,i)) res(trains);
            })
                .catch((err)=>{console.log(err);});
        }
    });
    function sliceupImage(image,key){
        let images = []
        let labels = []
        //let images = new Uint8Array(28*28*77*77);
        //let labels = new Uint8Array(10*77*77);
        context.drawImage(image,0,0);
        for(let y = 0; y < 77; ++y) {
                        for(let x = 0; x < 77; ++x) {
                                let slice = loadCanvas(context.getImageData(x*28,y*28,28,28).data,false);
                                //printslice(slice,key);
                                let label = convertLabel(key);
                                images.push(slice);
                                labels.push(label)
                                //images.set(slice,28*28*(77*y+x));
                                //labels.set(label,10*(77*y+x));
                        }
                }
        let tensors = {xs: images, ys: labels}
        //let tensors = convertToTensors(images,labels);
        trains.push(tensors);
        return trains.length==10? true : false;
    }
    function convertLabel(pos){
            let raw = [0,0,0,0,0,0,0,0,0,0];
            raw[pos] = 1;
            return raw;
    }
}

// Helper function for prepTrains
function loadCanvas(raw,compress) {
        // 1; Converts typed array to regular array -- courtesy https://stackoverflow.com/a/29862266/10571336
        let data1 = Array.prototype.slice.call(raw);
        // 2; Converts the image to single-value number per pixel (assumption: r,g,b,a are all EQ) -- courtesy https://stackoverflow.com/a/33483070/10571336
        let data2 = data1.filter(function(val,i,Arr) { return i % 4 == 1; })
        // 3; Cutoff of 30 on color -- gets best results
        let data3 = data2.map(x => x>30? 1 : 0);
        // 4; Converts to valid array for tensor
        //ret = Uint8Array.from(data3);
        return data3;
}

// Shuffles all of our digit sets together into 7 equal batches
async function shuffleTrains(sorted) {
    let shuffled_set = [{xs:[],ys:[]},{xs:[],ys:[]},{xs:[],ys:[]},{xs:[],ys:[]},{xs:[],ys:[]},{xs:[],ys:[]},{xs:[],ys:[]}];
    for(let i=0;i<(77*77);i++){
        for (let j=0;j<10;j++){
            try {
                shuffled_set[i%7].xs.push(sorted[j].xs.pop())
                shuffled_set[i%7].ys.push(sorted[j].ys.pop())
            } catch(err) { console.log(err); }
        }
    }
    for(let i=0;i<7;i++){
        let images = new Uint8Array(10*28*28*77*77/7);
        images.set(shuffled_set[i].xs.flat(),0);
        let labels = new Uint8Array(10*10*77*77/7);
        labels.set(shuffled_set[i].ys.flat(),0);
        shuffled_set[i] = convertToTensors(images,labels);
    }
    return shuffled_set;
}

// Converts arrays (Uint8Array) to tensors; xs is the image data, ys is the label
function convertToTensors(images,labels){
        let total = images.length/(28*28);
        let xs = tf.tensor4d(images,[total,28,28,1]);
        let ys = tf.tensor2d(labels,[total,10]);
        return {xs,ys};
}

// Calls asynchronous training in a loop on each batch
async function trainModel(model,data){
    return new Promise(async function(res,rej){
        for (let tensor of data){
            let fpromise = await trainHandler(model,tensor.xs,tensor.ys);
            //fpromise.then(()=>{console.log("fitted");});
        }
        console.log("trained");
        res(model);
    });
}

// Helper function for trainModel, trains a single batch
async function trainHandler(model,xs,ys){
    return new Promise(function(res,rej){
        let tpromise = model.fit(xs,ys);
        tpromise.then(()=>{res(model)});
    });
}

// Generator function; builds, trains and returns a model for saving
async function run(){
    return new Promise(function(res,rej){
        const empty = buildModel();
        let tpromise = prepTrains();
        tpromise.then((ret)=>{
            let spromise = shuffleTrains(ret);
            spromise.then((ret)=>{
                let mpromise = trainModel(empty,ret);
                mpromise.then((model)=>{
                    res(model);
                }).catch((err)=>{rej(err)});
            }).catch((err)=>{rej(err)});
        }).catch((err)=>{rej(err)});
    });
}

// Used in testing
function printslice(slice,i) {
    let temp = slice;
    //let temp = Array.from(slice)
    for (let y=0;y<28;y++){
        let row = temp.slice(0,28);
        console.log(row.join(""));
        temp = temp.slice(28);
    }
    console.log("------------------------"+"=="+i)
}