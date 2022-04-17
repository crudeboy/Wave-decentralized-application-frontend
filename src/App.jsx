import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
	/*
  * Just a state variable we use to store our user's public wallet.
  */
	const [currentAccount, setCurrentAccount] = useState('');
  let [totalCount, setTotalCount] = useState(0);
  let [totalCountForAddress, setTotalCountForAddress] = useState(0);
  const [displayCount, setDisplayCount] = useState(false);
  const [displayhash, setDisplayHash] = useState(false);
  const [displayAddressCount, setDisplayAddressCount] = useState(false);
  const [url, setUrl] = useState("https://rinkeby.etherscan.io/tx/")
  const [allWaves, setAllWaves] = useState([]);
  
	/**
	 * Create a variable here that holds the contract address after you deploy!
	 */
   const contractAddress = "0x0698e998da4b38976A3Ee07fec8B074EA35ff919";
                          
	/**
	 * Create a variable here that references the abi content!
	 */
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			/*
    * First make sure we have access to window.ethereum
    */
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			/*
      * Check if we're authorized to access the user's wallet
      */
			const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log(accounts, "accounts")

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Implement your connectWallet method here
	 */
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});
      console.log(accounts, "accounts second")
			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

  const displayCounts = () => {
    wave("Blockchain dev...awa re!!!");
    setDisplayCount(true)
  }

	//getting the number of waves
	const wave = async (message) => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
        setTotalCount(count.toNumber())
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
				const waveTxn = await wavePortalContract.wave(currentAccount, message, { gasLimit: 300000 });
				console.log('Mining...', waveTxn.hash);
        let trxHash = waveTxn.hash
        setUrl(url + trxHash)
        console.log(trxHash, "trxHash")
        console.log(url, "url")
        setDisplayHash(true)
				await waveTxn.wait();
        
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
        setTotalCount(count.toNumber())
        console.log(totalCount, "count", count)
				console.log('Retrieved total wave count...', count.toNumber());

        //get total waves for a particullar account
        const waveCountForAddress = await wavePortalContract.getNumberOfWavesByGee(currentAccount);
        setTotalCountForAddress(waveCountForAddress.toNumber())
        setDisplayAddressCount(true)
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

  const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};
	/*
  * This runs our function when the page loads.
  */
/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					I am farza and I worked on self-driving cars so that's pretty cool
					right? Connect your Ethereum wallet and wave at me!
				</div>

				<button className="waveButton" onClick={displayCounts}>
					Wave at Me
				</button>

          {/*//show totals only after the user has clicked on wave */}
   
        {
          displayCount && 
            <button className="waveButton">         
               Total Numbver of waves till Date {totalCount}
    				</button>  
        }
 
        {
          displayAddressCount && (
           <button className="waveButton">
            Waves count for your address : {totalCountForAddress}
  				</button>
          )
        }

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
          
        {
          displayhash && (
           <div className="waveButton">
             Monitor your transaction <a href={url}>here</a>
  				</div>
          )
        }
  
				{/*
        * If there is no currentAccount render this button
        */}
				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}
         
        
			</div>
		</div>
	);
};

export default App;
