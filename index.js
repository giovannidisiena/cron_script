require('dotenv').config();
const ethers = require('ethers');
let CronJob = require('cron').CronJob;

const init = async () => {
  const provider = ethers.getDefaultProvider('mainnet', {
    infura: '' // add infura endpoint here
  });
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  const account = signer.connect(provider);
  const linkswap = new ethers.Contract(
    '0x109d123cB3960BFa51a284a9B14EE7dB5CfBca59',
    ['function allocateSeigniorage() external'],
    account
  );
  const tx = await linkswap.allocateSeigniorage(
    { value, gasPrice: 80e9 }
  );
  console.log('Transaction hash: ${tx.hash}');

  const receipt = await tx.wait();
  console.log('Transaction was mined in block ${receipt.blockNumber}');
}

const job = new CronJob('0 */24 * * *', function(){
  init();
});
job.start();