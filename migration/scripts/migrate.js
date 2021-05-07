import connection from '../db/connection.js';
import UserSchema from '../db/core/User.js';

//Conrtracts 
import { abi as Artistabi, bytecode as Artistbytcode } from "../contracts/Artist.js";


import {  abi as PPPabi , bytecode as PPPbytecode  } from "../contracts/PayPerPlay.js";

import Web3 from "../web3/skale.js"
let account;

let getAccount = async () => {
  return new Promise((res,rej)=> {
    Web3.eth.getAccounts((err, accs)=>  {  
      if(err) throw err; 
      res(accs[0]);
    })
  })
  

};

async function Migrate() {
  const User = connection.model('User', UserSchema);

  const artists = await User.find({ profileAddress: { $exists: true, $ne: null } })
      .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: {$exists: false} }).limit(10).exec();
/*
  for (let index = 0; index < artists.length; index++) {
    //ToDo: Deploy Artist contract for each artist and update it to the db

    //ToDo: Get all releases from the Artist, loop through them and deploy them with the PPP contract
    //ToDo: update contract address in the database

    //ToDo: set migrated to true for the artist, perhaps we need this check on releases too? that way we can keep some progress if something goes wrong along the way
    console.log(artists[index]);
  }
  */

  account =  await getAccount(); 




  let artistContract =  new eth.Contract(Artistabi),
  contractsOptions = {  data : Artistbytcode },
  parameter = {
    from: account,
    gas: web3.utils.toHex(800000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
  }; 

  let artistPromises = [];

   //ToDo: Deploy Artist contract for each artist and update it to the db
  artists.forEach(ele => {
    contractsOptions.arguments = [  ele.profileAddress,
      ele.draftProfile.artistName,
      ele.draftProfile.ipfsImageUrl,
      ele.twitter.url,
      ele.facebook.url  ];
      artistPromises.push(artistContract.deploy(contractsOptions).send(parameter).on("confirmation" , ()=> {} ));
  });

//ToDo: update contract address in the database & set migrated to true for the artist,
  Promise.all(artistPromises).then((aContracts)=> {
    aContracts.forEach( async (ele, index) => {
      Artist.updateOne({   profileAddress :  artists[index].profileAddress  }, { 
                contractAddress : ele.address,
                migrated : true
                });
        })
  });

  
  //ToDo: Get all releases from the Artist, loop through them and deploy them with the PPP contract
    //ToDo: update contract address in the database
  
  /*
  address _owner,
            string memory _title,
            string memory _artistName,
            address _artistProfileAddress,
            uint _musicPerPlay,
            string memory _resourceUrl,
            bytes32 _contentType, 
            string memory _imageUrl,
            string memory _metadataUrl,
            address[] memory _contributors,
            uint[] memory _contributorShares

  */
  //




}

Migrate();
