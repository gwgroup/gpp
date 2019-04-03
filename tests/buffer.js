// var a=Buffer.from('2375030101019e','hex');
// console.log(a);
// a.forEach((byte)=>{
//     console.log(byte);
// });


// let buffer= new ArrayBuffer(5);
// // let buffer = new ArrayBuffer('0602010009', 'hex')
// let dataView = new DataView(buffer)
// dataView.setUint8(0,6);
// dataView.setUint8(1,2);
// dataView.setUint8(2,1);
// dataView.setUint8(3,0);
// dataView.setUint8(4,9);

// let buffer =Buffer.from('0602010009', 'hex');
// console.log(buffer);

function hex2Buffer(str){
    let len=str.length/2;
    let buffer=new ArrayBuffer(len);
    let dataView=new DataView(buffer);
    for(var i=0;i<len;i++){
        //console.log(parseInt(str.substr(i*2,2),16));
       dataView.setUint8(i,parseInt(str.substr(i*2,2),16));
    }
    return buffer;
}

console.log(hex2Buffer('23750c010200090000030000020000b5'));