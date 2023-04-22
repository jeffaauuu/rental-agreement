const Web3 = require('web3');

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
        App.rentalAgreement = await App.contracts.RentalAgreement.deployed()
        // Hydrate the smart contract with values from the blockchain
    },

    render: async () => {
        if (App.loading) {
            return;
        }
        /*console.log(isInit);
        if(isInit){
            window.location = "index1.html"
        }
        */
        $('#rentalAgreementForm').on('submit', async (event) => {
            event.preventDefault(); // Prevent the form from submitting
            //App.rentalAgreement = await App.contracts.RentalAgreement.new({ from: App.account[0], gas: 3000000 })
            
            const landlord = $('#landlord').val(); // replace with the landlord's address
            const tenant = $('#tenant').val(); // replace with the tenant's address
            const rentAmount = $('#rentAmount').val(); // replace with the rent amount in ether
            const securityDeposit = $('#securityDeposit').val(); // replace with the security deposit in ether
            const rentalPeriod = $('#rentalPeriod').val(); // replace with the rental period in months
            console.log('Landlord address:', landlord);
            console.log('Tenant address:', tenant);
            console.log('Rent Amount:', rentAmount);
            console.log('Security Deposit:', securityDeposit);
            console.log('Rental Period:', rentalPeriod);
            


            App.rentalAgreement.initialize(landlord, tenant, rentAmount, securityDeposit, rentalPeriod, { from: App.account[0], gas: 3000000 });

            window.location = "index1.html";
        });


        App.setLoading(true)

        // Render Account
        $('#account').html(App.account)

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

$(() => {
    $(window).load(() => {
        App.load();
    })
})
