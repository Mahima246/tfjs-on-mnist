
//	Canvas Loading Function; takes data as flattened rgba array from canvas context and converts to single-pixel binary
//
export function loadCanvas(raw) {
	// 1; Converts typed array to regular array -- courtesy https://stackoverflow.com/a/29862266/10571336
	let data1 = Array.prototype.slice.call(raw);
	// 2; Converts the image to single-value number per pixel (assumption: r,g,b,a are all EQ) -- courtesy https://stackoverflow.com/a/33483070/10571336
	let data2 = data1.filter(function(val,i,Arr) { return i % 4 === 0; })
	// 3; Converts 256/0 to 1/0
	let data3 = data2.map(x => x===0? x : 1);
	// 4; Takes 10x10 chunks of the corresponding image, adds them up, then decides if compressed result is 1/0
	let ret = [];	
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
	return ret;	
}
