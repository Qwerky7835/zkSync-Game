const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Game and Event Testing", function () {
  // Fixture to return to the initial deployed state of the blockchain
  async function deployGameFixture() {
    /*
    Owner = Owns the Game smart contract
    Winner = the account that will place 1 winning bet
    Loser = the account that places several losing bets
    */
    const [owner, winner, loser] = await ethers.getSigners();

    const GameByteCode = await ethers.getContractFactory("Game");
    const deployed_game = await GameByteCode.deploy();
    await deployed_game.deployed();

    return { deployed_game, owner, winner, loser};
  }

  describe("Initialize correct ownership", function(){
    it("Game is owned by deployment signer", async function () {
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

      expect(await deployed_game.owner()).to.equal(owner.address);
    });

    it("MatterToken is owned by Game contract", async function () {
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);
      const deployed_mattertoken = await hre.ethers.getContractAt("MatterToken", deployed_game.token());

      expect(await deployed_mattertoken.owner()).to.equal(deployed_game.address);
    });
  })

  describe("Game Play", function () {

    it("Revert on incorrect eth amount", async function () {
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

      //Check secret number
      const secret_number = await deployed_game.get_secret();
      //console.log(secret_number)

      //Owner sends wrong eth amount, expecting a revert to occur
      await expect(deployed_game.guess(42, {
      value: ethers.utils.parseEther("0.01"),
      }))
        .to.be.revertedWith("exactly 0,001 eth must be sent");
    });

    it("Owner sets secret_number", async function(){
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

      await deployed_game.change_secret(42);

      expect(await deployed_game.get_secret()).to.equal(42);
    });

    describe("Loser makes wrong guesses", function(){
      it("Losing Account balance decreases", async function(){
        const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

        await deployed_game.change_secret(42);

        //Make a wrong guess
        const tx = await deployed_game.connect(loser).guess(765, {
          value: ethers.utils.parseEther("0.001"),  // Sends exactly 1 finney
        });

        const loser_balance = await ethers.provider.getBalance(loser.address);

        //Check gas paid
        const receipt = await tx.wait();
        const gasUsed = (receipt.cumulativeGasUsed * receipt.effectiveGasPrice)/10**18;
        
        // Less than assertion since gas calculations are not exact. 
        expect(Number(ethers.utils.formatEther(loser_balance))).to.be.below(10000 - 0.001);
      });

      it("Eth in Game contract increases after losses", async function (){
        const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

        //Change secret to 42
        await deployed_game.change_secret(42);

        //Make a wrong guess
        const tx = await deployed_game.guess(2342, {
          value: ethers.utils.parseEther("0.001"),  // Sends exactly 1 finney
        });
        
        const contract_balance = await ethers.provider.getBalance(deployed_game.address);
        expect(contract_balance).to.equal(ethers.utils.parseEther("0.001"))
      });
    });

    describe("Winner makes correct guess", function(){

      async function playGameFixture(deployed_game, loser, winner){
        
        await deployed_game.change_secret(42);

        //Loser places three incorrect guesses
        const tx = await deployed_game.connect(loser).guess(8327598, {
          value: ethers.utils.parseEther("0.001"),
        });
        await tx.wait();

        const tx2 = await deployed_game.connect(loser).guess(97305, {
          value: ethers.utils.parseEther("0.001"),
        });
        await tx2.wait();

        const tx3 = await deployed_game.connect(loser).guess(65, {
          value: ethers.utils.parseEther("0.001"),
        });
        await tx3.wait();

        //winner guesses the answer to life - 42
        const tx4 = await deployed_game.connect(winner).guess(42, {
          value: ethers.utils.parseEther("0.001"),
        });
        const winning_receipt = await tx4.wait();

        return winning_receipt;
      }

      it("Winner gets 80% of Game contract eth", async function(){
        const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

        const win_tx = await playGameFixture(deployed_game, loser, winner);

        const payout_amount = win_tx.events[1].args.payout_amount;

        const winnings = 0.001*4*0.8 // 4 guesses total (3 wrong, 1 right)

        expect(payout_amount).to.equal(ethers.utils.parseUnits(winnings.toString(), "ether"));
      });

      it("Winner gets 100 Matter Tokens", async function(){
        const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

        await playGameFixture(deployed_game, loser, winner);

        const deployed_mattertoken = await hre.ethers.getContractAt("MatterToken", deployed_game.token());
        expect(await deployed_mattertoken.balanceOf(winner.address)).to.equal(100);
      });
    });
  });

  describe("Events", function () {
    it("emit loss event on wrong guess", async function () {
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

      //Change secret to 42
      await deployed_game.change_secret(42);

      //Make a wrong guess and emit event
      await expect(
        deployed_game.connect(loser).guess(9723, {
        value: ethers.utils.parseEther("0.001")
        }))
        .to.emit(deployed_game, "Loser")
        .withArgs(loser.address);
    });

    it("emit win event on correct guess", async function(){
      const { deployed_game, owner, winner, loser } = await loadFixture(deployGameFixture);

      //Change secret to 42
      await deployed_game.change_secret(42);

      //Make a wrong guess
      const tx = await deployed_game.connect(loser).guess(0, {
          value: ethers.utils.parseEther("0.001"),
        });
      await tx.wait();

      //Make a correct guess and emit event
      await expect(
        deployed_game.connect(winner).guess(42, {
        value: ethers.utils.parseEther("0.001")
        }))
        .to.emit(deployed_game, "Winner")
        .withArgs(winner.address, ethers.utils.parseUnits("0.0016", "ether")); //0.002 * 0.8
    });
  });
});