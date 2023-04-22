const RentalAgreement = artifacts.require("RentalAgreement");

contract("RentalAgreement", (accounts) => {
  let rentalAgreement;
  const [landlord, tenant] = accounts;
  const rentAmount = 100;
  const securityDeposit = 200;
  const rentalPeriod = 2592000; // 30 days in seconds

  beforeEach(async () => {
    rentalAgreement = await RentalAgreement.new();
    await rentalAgreement.initialize(landlord, tenant, rentAmount, securityDeposit, rentalPeriod);
  });

  it("should allow landlord and tenant to sign the rental agreement", async () => {
    await rentalAgreement.sign({ from: landlord, value: rentAmount + securityDeposit });
    await rentalAgreement.sign({ from: tenant, value: rentAmount + securityDeposit });

    const landlordSignature = await rentalAgreement.signatures(landlord);
    const tenantSignature = await rentalAgreement.signatures(tenant);
    const isSigned = await rentalAgreement.isSigned();

    assert.equal(landlordSignature, true, "Landlord did not sign the rental agreement");
    assert.equal(tenantSignature, true, "Tenant did not sign the rental agreement");
    assert.equal(isSigned, true, "The rental agreement was not signed");
  });

  it("should not allow unauthorized users to sign the rental agreement", async () => {
    try {
      await rentalAgreement.sign({ from: accounts[2], value: rentAmount + securityDeposit });
      assert.fail("An unauthorized user was able to sign the rental agreement");
    } catch (error) {
      assert.include(error.message, "You are not authorized to sign");
    }
  });

  it("should not allow the landlord to sign the rental agreement twice", async () => {
    await rentalAgreement.sign({ from: landlord, value: rentAmount + securityDeposit });

    try {
      await rentalAgreement.sign({ from: landlord, value: rentAmount + securityDeposit });
      assert.fail("The landlord was able to sign the rental agreement twice");
    } catch (error) {
      assert.include(error.message, "Landlord has already signed");
    }
  });

  it("should not allow the tenant to sign the rental agreement twice", async () => {
    await rentalAgreement.sign({ from: tenant, value: rentAmount + securityDeposit });

    try {
      await rentalAgreement.sign({ from: tenant, value: rentAmount + securityDeposit });
      assert.fail("The tenant was able to sign the rental agreement twice");
    } catch (error) {
      assert.include(error.message, "Tenant has already signed");
    }
  });

  it("should set the start date and end date when the rental agreement is signed", async () => {
    await rentalAgreement.sign({ from: landlord, value: rentAmount + securityDeposit });
    await rentalAgreement.sign({ from: tenant, value: rentAmount + securityDeposit });

    const startDate = await rentalAgreement.startDate();
    const endDate = await rentalAgreement.endDate();

    assert.isAbove(startDate.toNumber(), 0, "The start date was not set");
    assert.equal(endDate.toNumber(), startDate.toNumber() + rentalPeriod, "The end date was not set correctly");
  });

  it("should allow the landlord to terminate the rental agreement", async () => {
    await rentalAgreement.sign({ from: landlord, value: rentAmount + securityDeposit });
    await rentalAgreement.sign({ from: tenant, value: rentAmount + securityDeposit });
    await rentalAgreement.terminate({ from: landlord });

    const isTerminated = await rentalAgreement.isTerminated();
    assert.isTrue(isTerminated, "Rental agreement was not terminated");
  });
});
