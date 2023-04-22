const RentalAgreement = artifacts.require("RentalAgreement");

module.exports = function(deployer) {
  deployer.deploy(RentalAgreement);
};
