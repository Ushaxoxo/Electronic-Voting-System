App = {
    contracts: {},
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
      
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = ethereum
        web3 = new Web3(ethereum)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await window.ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    
    loadAccount: async () => {
        App.account =  window.ethereum.selectedAddress;
        console.log(App.account)
    },

    loadContract: async () => {
        const vs = await $.getJSON('VotingSystem.json')
        App.contracts.VotingSystem = TruffleContract(vs) 
        App.contracts.VotingSystem.setProvider(App.web3Provider)
        App.vs = await App.contracts.VotingSystem.deployed()
    },
    
    render: async() => {
        if (App.loading){
            return
        }
        App.setLoading(true)

        $('#account').html(App.account)

        await App.renderCandidates()

        App.setLoading(false)
    },

    renderCandidates: async () => {
        const candidateCount = await App.vs.candidateCount();
        const $candidateTemplate = $('.candidateTemplate');
        const $candidateList = $('#candidateList');
      
        // Empty the list of candidates
        $candidateList.empty();
      
        // Loop through each candidate and display their details
        for (var i = 1; i <= candidateCount.toNumber(); i++) {
          const candidate = await App.vs.candidates(i);
          const candidateID = candidate[0].toNumber();
          const candidateName = candidate[1];
          const candidateParty = candidate[2];
          const vote = candidate[3].toNumber();
          const voted = false;
          console.log(candidateID, candidateName, candidateParty, vote);
      
          const $newcandidateTemplate = $candidateTemplate.clone();
          $newcandidateTemplate.find('.content').html(candidateName);
          $newcandidateTemplate.find('.party').html(candidateParty);
          $newcandidateTemplate.find('input')
            .prop('name', 'candidate')
            .prop('value', candidateID)
            .on('change', async function() {
              // When the radio button is changed
              const candidateId = $(this).prop('value');
              console.log('Radio button clicked for candidate ID:', candidateId);
              // Vote for the candidate
              await App.vs.vote(candidateId);
              console.log('Vote counted for candidate ID:', candidateId);
              // Clear the previously selected candidate
              $candidateList.find('input:checked').prop('checked', false);
              // Mark the newly selected candidate as checked
              $(this).prop('checked', true);
            });
      
          $candidateList.append($newcandidateTemplate.html());
          $candidateList.append($('<br>'));
        }
      },
      vote: async () => {
        // get the selected candidate ID from the radio button
        const candidateId = $('input[type=radio][name=candidate]:checked').val();
        console.log("Selected candidate ID: ", candidateId);
        const candidateselected = await App.vs.candidates(candidateId)
        // get the default account address from web3
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
      
        // vote for the candidate using the specified from address
        await App.vs.vote(candidateId, { from });
      
        console.log('Vote counted for candidate ID:',candidateselected.vote.toNumber() );
      
        // update the chosenCandidate ul with the selected candidate's information
        const candidate = await App.vs.candidates(candidateId);
        const name = candidate[1];
        const party = candidate[2];
        $('#chosenCandidateName').text(name);
        $('#chosenCandidateParty').text(party);
      },
      
          


      // Show the task
   
        

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      },

     

}
$(() => {
    $(window).load(() => {
      App.load()
    })
  })