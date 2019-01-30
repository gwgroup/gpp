var rpservice=require('../services/red-packet');
// rpservice.createRedPacketActive({act_name:'新春风',send_name:'吉祥窗帘',wishing:'祝各位市民新春快乐'},'f8316388-1562-11e9-ab14-d663bd873d93',(err,result)=>{
//     console.log(err,result);
// });
rpservice.generateRedPacketCards({red_packet_id:'4c77549f-077e-4fd9-8ed8-43be12717e83',moneys:[1.23,910,1.98,2764.12]},'f8316388-1562-11e9-ab14-d663bd873d93',(err,result)=>{
    console.log(err,result);
});