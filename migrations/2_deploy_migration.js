const ArtistContract = artifacts.require("Artist");
const mongoose = require('mongoose');
const { accessSync } = require('node:fs');
const uri = process.env.MONGODB_URL;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

let Artist = require('./../models/artists');

let aArtists ;


module.exports = async (deployer) {
    
    
    let aPromises = [];

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function() {
        console.log("Fetching All artists from DB...")
        aArtists =  await Artist.find({});
        
        console.log("Got Artists, deploying contracts....");
        
        aArtists.forEach((ele)=> {
            aPromises.push(deployer.deploy(ArtistContract,
                 ele.ethAddress,
                 ele.artistName,
                 ele.imageUrl,
                 ele.descriptionUrl,
                 ele.socialUrl
                 ));
         });   
    
        //Update the artists contract addresses
         Promise.all(aPromises).then(updateContractAddress);

        });

     let updateContractAddress = (aResults) => {
        console.log("contracts have been deployed ....");
        aResults.forEach((ele, index)=> {
         Artist.updateOne({   ethAddress :  aArtists[index].ethAddress  }, { 
                contractAddress : ele.options.address 
                });
        })
     };
     
     


};
