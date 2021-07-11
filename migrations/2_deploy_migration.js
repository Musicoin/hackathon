require('dotenv').config();
const ArtistContract = artifacts.require("Artist");
const mongoose = require('mongoose');
const uri = "mongodb+srv://condplyr:5MHmRgOVNv3IzxZ5@cluster0.tnors.mongodb.net/musicoin?retryWrites=true&w=majority";

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

let Artist = require('./../models/artists');

let aArtists ;


module.exports = async (deployer) =>  {
   
    let aPromises = [];
    let    updateContractAddress = (aResults) => {
        //console.log(aResults[0]); 
        console.log(aArtists[0].ethAddress);
        aResults.forEach( async (ele, index) => {

      await  Artist.updateOne({   ethAddress :  aArtists[index].ethAddress  }, { 
                contractAddress : ele.address 
                });
        })
     };

    db.on('error', console.error.bind(console, 'connection error:'));

   // db.once('open', async () => {
        console.log("Fetching All artists from DB...")
        aArtists =  await Artist.find({});
        
        if(aArtists.length == 0){
            console.log("can not find artists");
            return;
        }
       // console.log("Got Artists, deploying contracts....");
        
        aArtists.forEach((ele)=> {
            console.log("Got Artists, deploying contracts....");
            aPromises.push(deployer.deploy(ArtistContract,
                 ele.ethAddress,
                 ele.artistName,
                 ele.imageUrl,
                 ele.descriptionUrl,
                 ele.socialUrl
                 ));
         });   
         

             //Update the artists contract addresses
         await Promise.all(aPromises).then(updateContractAddress);

     //   });

  
     
     


};
