import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import React from "react";
import ReactDOM from "react-dom";
import { getBalances } from "./balances";
import { makeDeposit } from "./deposit";
import { addMinter } from "./addMinter";
import { registerOnMainnet } from "./addERC20TokenByOwner";
import { registerOnSchain } from "./schain_addERC20TokenByOwner";
import { exit } from "./exit";
import { rechargePool } from "./rechargePool";

import "./styles.css";

getBalances();

function App() {
  return (
      <div className="App">
        <h2>Setup</h2>
        <u>
          Replace the credentials in .env file <br />
        </u>
        <h6 className="text-left mt-2 pl-5">Pre Step 1:</h6>
        <p className="text-left ml-5 pl-5">
          <b>Review ERC20 Implementation:</b> <br />
          Check out MyERC20.sol under /contract <br />
          <br />
          ERC20 contract deployed to SKALE will need to <br />
          implement ERC20Mintable functionality <br />
          and ERC20Burnable functionality
        </p>
        <h6 className="text-left pl-5">Pre Step 2:</h6>
        <p className="text-left ml-5 pl-5">
          <b>
            Add Token Manager ERC20 as Minter on <br />
            SKALE Chain ERC20 Token:
          </b>
          <br /> <br />
          <button onClick={addMinter}>Add Minter</button>
        </p>
        <h6 className="text-left pl-5">Pre Step 3:</h6>
        <p className="text-left ml-5 pl-5">
          <b>Register ERC20 contract on mainnet</b>
          <br />
          <br />
          <button onClick={registerOnMainnet}>Register on Mainnet</button>
        </p>
        <h6 className="text-left pl-5">Pre Step 4:</h6>
        <p className="text-left ml-5 pl-5">
          <b>Register ERC20 contract on SKALE Chain</b>
          <br />
          <br />
          <button onClick={registerOnSchain}>Register on SKALE Chain</button>
        </p>
        <div className="border-top" />
        <h2>Usage</h2>

        <h6 className="text-left mt-2 pl-5">Step 1:</h6>
        <p className="text-left ml-5 pl-5">
          <b>Deposit:</b> sends 1 ERC20 token into a deposit box.
        </p>
        <h6 className="text-left pl-5">Step 2:</h6>
        <p className="text-left ml-5 pl-5">
          <b>Exit:</b> sends 1 ERC20 token back to Rinkeby testnet.
        </p>
        <div className="row border-top mt-2 pt-4">
          <div className="col-6 border-right">
            <h4 className="text-center pt-2">Rinkeby</h4>
            <div className="dataBox">
              <div className="row py-3">
                <div className="col-sm-12 ml-2 text-left">
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span>ERC20 Account Balance: </span>
                    </div>
                    <input type="text" id="rinkeby_balance" disabled />
                  </div>
                </div>
                <div className="col-sm-12 ml-2 text-left">
                  <div className="input-group mb-3">
                    <div className="input-group-prepend">
                      <span>Community Pool: </span>
                    </div>
                    <input type="text" id="community_balance" disabled />
                  </div>
                </div>
              </div>
            </div>
            <button onClick={makeDeposit}>Deposit</button>
            <button onClick={rechargePool}>Recharge Pool</button>
          </div>
          <div className="col-6">
            <h4 className="text-center pt-2">SKALE Chain</h4>
            <div className="dataBox">
              <div className="row py-3">
                <div className="col-sm-12 text-left">
                  <div className="input-group mb-3 mx-auto">
                    <div className="input-group-prepend">
                      <span>ERC20 Account Balance: </span>
                    </div>
                    <input type="text" id="skale_balance" disabled />
                  </div>
                  <div className="col-sm-12 text-left">
                    <div className="input-group mb-3 mx-auto">
                      <div className="input-group-prepend">
                        <span>Minter Enabled: </span>
                      </div>
                      <input type="text" id="lnd_minter" disabled value="" />
                    </div>
                  </div>
                  <div className="col-sm-12 text-left">
                    <div className="input-group mb-3 mx-auto">
                      <div className="input-group-prepend">
                        <span>skETH Balance: </span>
                      </div>
                      <input
                          type="text"
                          id="schain_sketh_balance"
                          disabled
                          value=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={exit}>Exit</button>
          </div>
        </div>
      </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
