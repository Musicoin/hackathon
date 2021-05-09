import connection from '../db/connection.js';
import UserSchema from '../db/core/User.js';
import ReleaseSchema from '../db/core/Release.js';

//Conrtracts
import { abi as Artistabi, bytecode as Artistbytcode } from "../contracts/Artist.js";


import { abi as PPPabi, bytecode as PPPbytecode } from "../contracts/PayPerPlay.js";

import web3 from "../web3/skale.js"
let account;

let getAccount = async () => {
  return new Promise((res, rej) => {
    web3.eth.getAccounts((err, accs) => {
      if (err) throw err;
      res(accs[0]);
    })
  })
};

async function Migrate() {
  const User = connection.model('User', UserSchema);

 

  account = await getAccount();

  var artistContract = new web3.eth.Contract(Artistabi),
    releaseContract = new web3.eth.Contract(PPPabi),
    artistContractsOptions = { data: Artistbytcode },
    PPPContractOptions = {data: PPPbytecode},
    parameter = {
      from: account,
      gas: web3.utils.toHex(800000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei'))
    };

  var artistPromises = [];
  const Release = connection.model('Release', ReleaseSchema);

  let deployReleases = async (artistAddress) => {
      let releases = await Release.find({ artistAddress: artistAddress, migrated : {  $exists : false } }).limit(10).exec();

      //true if all the releases from a artist have been deployed
      if( !releases || releases.length == 0) return true;

  for ( let ele of releases) {
      
      PPPContractOptions.arguments = [
        account,
        ele.title,
        ele.artistName,
        artistAddress,
        1000000,
        ele.resourceUrl,
        "audio/mp3",
        ele.imageUrl,
        [],
        []        
      ];

        
      let deploy_contrt = await releaseContract.deploy(PPPContractOptions).send(parameter).on("confirmation", () => { });
      
      if(deploy_contrt)
         await Release.updateOne({ artistAddress: artistAddress }, {
          contractAddress: deploy_contrt.address,
          migrated: true
        });


    }

    deployReleases(artistAddress);
    
  }

 const artists = await User.find({ profileAddress: { $exists: true, $ne: null } })
    .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: { $exists: false } }).limit(10).exec();
  //ToDo: Deploy Artist contract for each artist and update it to the db
  
    if(artists)
    for(let ele of artists) 
    {
    artistContractsOptions.arguments = [
    ele.profileAddress,
    ele.draftProfile.artistName,
    ele.draftProfile.ipfsImageUrl,
    ele.twitter.url,
    ele.facebook.url ];

    artistPromises.push(artistContract.deploy(artistContractsOptions).send(parameter, ()=> {} ).on("confirmation", () => { }));
    //get All release and push it in array for deployment
    deployReleases(ele.profileAddress);
  }

  //ToDo: update contract address in the database & set migrated to true for the artist,
  Promise.allSettled(artistPromises).then((aContracts) => {
    console.log("All contracts have been deployed");
    aContracts.forEach(async (ele, index) => {
      
      if(ele.status == "fulfilled")
      Artist.updateOne({ profileAddress: artists[index].profileAddress }, {
        contractAddress: ele.value.address,
        migrated: true
      });


    })
  });

  //ToDo: Get all releases from the Artist, loop through them and deploy them with the PPP contract
  //ToDo: update contract address in the database




}

Migrate();
