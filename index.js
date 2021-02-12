require('dotenv').config()
const ethers = require('ethers')
let CronJob = require('cron').CronJob

const init = async () => {
  const provider = ethers.getDefaultProvider('mainnet', {
    infura: process.env.INFURA_ID,
  })
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY)
  const account = signer.connect(provider)
  const linkswap = new ethers.Contract(
    '0x109d123cB3960BFa51a284a9B14EE7dB5CfBca59',
    [
      'function allocateSeigniorage() external',
      'function getSeigniorageOraclePrice() public view returns (uint)',
    ],
    account
  )
  let gasPrice
  let oraclePrice
  try {
    gasPrice = await provider.getGasPrice()
  } catch (err) {
    console.log(err)
    gasPrice = ethers.BigNumber.from('100000000000')
  }
  gasPrice.add(ethers.BigNumber.from('10000000000'))
  try {
    oraclePrice = await linkswap.getSeigniorageOraclePrice()
  } catch (err) {
    console.log(err)
    console.log('Failed to getSeigniorageOraclePrice... terminating.')
    return
  }
  if (oraclePrice > ethers.BigNumber.from('1000000000000000000')) {
    let gasLimit = ethers.BigNumber.from(process.env.GAS_LIMIT)
    try {
      const tx = await linkswap.allocateSeigniorage({ gasPrice, gasLimit })
      console.log('Transaction hash:', tx.hash)

      const receipt = await tx.wait()

      console.log('Transaction was mined in block', receipt.blockNumber)
    } catch (err) {
      console.log(err)
    }
  } else {
    console.log(
      'SeigniorageOraclePrice > 1e18, so allocateSeigniorage not called'
    )
  }
}
console.log('Script is wating for the Cronjob to execute')
const job = new CronJob('0 0 * * *', function() {
  console.log('Cronjob Executed')
  init()
});
job.start();
