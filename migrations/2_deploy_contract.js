const VotingSystem = artifacts.require("VotingSystem");

module.exports = function(deployer) {
  deployer.deploy(VotingSystem,["Sanjana","Usha","Vaissh","Santhipriya"],["Bongress","TJP","AAMK","BMK"]);
};
