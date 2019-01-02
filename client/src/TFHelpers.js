import * as tf from '@tensorflow/tfjs';

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
	//ret = Uint8Array.from(ret);
	
	return ret;	
}
