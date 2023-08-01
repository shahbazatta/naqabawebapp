/**************************
 * Description:
 * @Created On: 25/06/23
 ***************************/
//const dbCon = require("../db/conn");

const dgram = require('dgram');

const server_PORT = 3006;
const local_address = '127.0.0.1';


exports.updateAvlData = (req, res) => {

   let avlDataJson = req.body;
   console.log(avlDataJson);
   let msg = "received";
   if (!isValiJson(avlDataJson)) {
      msg = "Invalid data";
      let json = {status: 200, result: "error", msg: msg};
      res.send(json);
   } else {

      let data = Buffer.from(JSON.stringify(avlDataJson), 'utf-8');
      data = data.toString('hex');
      const client = dgram.createSocket('udp4');
      try {

         client.on('listening', function () {
            let address = client.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
         });
         client.on('message', function (message, remote) {
            console.log('Response from server', remote.address + ':' + remote.port + ' - ', message);
            msg = message;
         });
         client.send(data
            , 0, data.length, server_PORT, local_address, function (err, bytes) {
               console.log(err || String(bytes), 'bytes sent');
               client.close();
            });
      } catch (e) {
         console.error(e, avlDataJson);
         client.close();
         msg = e.toString();
      }
      client.on('close', function () {
         let json = {status: 200, result: "success", msg: msg};
         res.send(json);
      });
   }
};

function isValiJson(jsonData) {
   if (jsonData) {
      return true;
   }
   return false;
}
/*   let avlDataJson = {
      imei: 862095054357147,
      avltm: 1676987628000,
      location: {
         type: 'Point',
         coordinates: [39.63957977294922, 22.609296798706055]
      },
      alt: 2,
      ang: 56,
      spd: 0,

   };
  */
