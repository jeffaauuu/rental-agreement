var Web3Utils = require('web3')

App = {
    contracts: {},
    loading: false,

    load: async () => {
        await App.loadWeb3();
        await App.loadAccounts();
        await App.loadContract();
        await App.render();

    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        window.addEventListener('load', async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                window.web3 = new Web3(ethereum);
                try {
                    // Request account access if needed
                    await ethereum.enable();
                    // Acccounts now exposed
                    web3.eth.sendTransaction({/* ... */ });
                } catch (error) {
                    // User denied account access...
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                window.web3 = new Web3(web3.currentProvider);
                // Acccounts always exposed
                web3.eth.sendTransaction({/* ... */ });
            }
            // Non-dapp browsers...
            else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        });
    },

    loadAccounts: async () => {
        // connect to all the accounts, we want index 0 since, its the first account
        // the account we are connected to
        App.account = await ethereum.request({ method: 'eth_accounts' });
        console.log(App.account[0]);
    },

    loadContract: async () => {
        // create a JS version of the contractsS
        const rentalAgreement = await $.getJSON('RentalAgreement.json')
        App.contracts.RentalAgreement = TruffleContract(rentalAgreement)
        App.contracts.RentalAgreement.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));

        // Hydrate the smart contract with values from the blockchain
        App.rentalAgreement = await App.contracts.RentalAgreement.deployed()
    },

    render: async () => {
        if (App.loading) {
            return;
        }
        /*
        const landlord = "0xcfce01d181b711b5C0b2Ec7C27A692d4648327c3"; // replace with the landlord's address
        const tenant = "0xaa8af7C1F35564dba1c20F3588Bc245a2feac4CD"; // replace with the tenant's address
        const rentAmount = 1000; // replace with the rent amount in ether
        const securityDeposit = 10; // replace with the security deposit in ether
        const rentalPeriod = 12; // replace with the rental period in months

        await App.rentalAgreement.initialize(landlord, tenant, rentAmount, securityDeposit, rentalPeriod, { from: App.account[0],gas:3000000 });
        */
        // Get the deployed instance of the RentalAgreement contract

        

        const landlordAddress = await App.rentalAgreement.landlord();
        console.log('Landlord address:', landlordAddress);
        $('#landlord').append(landlordAddress);

        const tenantAddress = await App.rentalAgreement.tenant();
        console.log('Tenant address:', tenantAddress);
        $('#tenant').append(tenantAddress);

        const rentAmount1 = await App.rentalAgreement.rentAmount();
        console.log('Rent Amount:', rentAmount1.c[0]);
        $('#rentAmount').append(rentAmount1.c);

        const securityDeposit1 = await App.rentalAgreement.securityDeposit();
        console.log('Security Deposit:', securityDeposit1.c[0]);
        $('#securityDeposit').append(securityDeposit1.c);

        const rentalPeriod1 = await App.rentalAgreement.rentalPeriod();
        console.log('Rental Period:', rentalPeriod1.c[0]);
        $('#rentalPeriod').append(rentalPeriod1.c);

        const isSigned = await App.rentalAgreement.isSigned();
        if (isSigned) {
            $('#isSigned').append('Yes');
        } else {
            $('#isSigned').append('No');
        }
        const timestamp = await App.rentalAgreement.startDate();
        if (isSigned) {
            console.log(timestamp.c[0])
            $('#startDate').append(new Date(timestamp.c[0] * 1000).toLocaleDateString());
        } else {
            $('#startDate').append('NA');
        }

        if (isSigned) {
            console.log(timestamp.c[0] + rentalPeriod1.c[0] * 30 * 24 * 60 * 60)
            $('#endDate').append(new Date((timestamp.c[0] + (rentalPeriod1.c[0] * 30 * 24 * 60 * 60)) * 1000).toLocaleDateString());

        } else {
            $('#endDate').append('NA');
        }

        const isTerminated = await App.rentalAgreement.isTerminated();
        if (isTerminated) {
            $('#isTerminated').append('Yes');
        } else {
            $('#isTerminated').append('No');
        }
        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

        // Get the sign button element
        const signButton = document.getElementById("signButton");

        // Add an event listener to the sign button
        signButton.addEventListener("click", function () {
            // Call the sign function
            console.log("sign works")
            console.log(App.account)
            try{
                if(App.account[0] == tenantAddress){
                    console.log('in if')
                    App.rentalAgreement.sign({ value: rentAmount1.c[0] + securityDeposit1.c[0],from: App.account[0],gas:3000000});
                }
                else{
                    console.log('in else')
                    App.rentalAgreement.sign({value: rentAmount1.c[0] + securityDeposit1.c[0],from: App.account[0],gas:3000000});
                }
            }
            catch(error){
                console.log(error);
            }
            location.reload(true);
        });

        const terminateButton = document.getElementById("terminateButton");

        // Add an event listener to the sign button
        terminateButton.addEventListener("click", function () {
            // Call the sign function
            console.log("terminate works")
            console.log(App.account)
            try{
                if(App.account[0] == landlordAddress){
                    console.log('in if')
                    App.rentalAgreement.terminate({ from: App.account[0]});
                }
                else{
                    console.log('only landlord can ')
                }
            }
            catch(error){
                console.log(error);
            }
            location.reload(true);
        });
        // Render Tasks
        // await App.renderTasks()

        // Update loading state
        App.setLoading(false)
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    }
}

$(() =>{
    $(window).load(() => {
        App.load();
    });
})
