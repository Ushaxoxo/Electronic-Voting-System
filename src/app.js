App = {

  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
    await App.displayCandidates();
    await App.displayElectionResult();
    

  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        
        await ethereum.enable()
       
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        
      }
    }

    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      web3.eth.sendTransaction({/* ... */})
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account =  await window.ethereum.selectedAddress;
    console.log(App.account)
  },

  loadContract: async () => {
    const vs = await $.getJSON('VotingSystem.json')
    const mt= await $.getJSON('merkletree.json')
    App.contracts.VotingSystem = TruffleContract(vs) 
    App.contracts.VotingSystem.setProvider(App.web3Provider)
    App.vs = await App.contracts.VotingSystem.deployed()
},


loadContract: async () => {
  const vs = await $.getJSON('VotingSystem.json')
  App.contracts.VotingSystem = TruffleContract(vs) 
  App.contracts.VotingSystem.setProvider(App.web3Provider)
  App.vs = await App.contracts.VotingSystem.deployed()
},

verifyVote: async (event) => {
  event.preventDefault();

  const voterIdInput = document.getElementById('voterid');
  const voterId = voterIdInput.value;

  const hasVoted = await App.vs.hasVoted(voterId);
  console.log(hasVoted);

  if (hasVoted) {
    alert('The voter has already voted.');
  } else {
    alert('The voter has not voted yet.');
  }
},

  render: async () => {
    // Prevent double render
    // if (App.loading) {
    //   return
    // }

    $('#account').html(App.account)

    await App.renderCandidates()
  },

  renderCandidates: async () => {
    const candidateCount = await App.vs.numCandidates();
    // const $candidateTemplate = $('.candidateTemplate');
    // const $candidateList = $('#candidateList');
  
    // // Empty the list of candidates
    // $candidateList.empty();
  
    // Loop through each candidate and display their details
    for (var i = 0; i < candidateCount.toNumber(); i++) {
       const candidate = await App.vs.candidates(i);
       const candidateID = candidate[0].toNumber();
       const candidateName = candidate[1];
       const candidateParty = candidate[2];
        const vote = candidate[3].toNumber();
  
    //   // const voted = false;
       console.log(candidateID, candidateName, candidateParty,vote);

     }
    //   const $newcandidateTemplate = $candidateTemplate.clone();
    //   $newcandidateTemplate.find('.content').html(candidateName);
    //   $newcandidateTemplate.find('.party').html(candidateParty);
    //   $newcandidateTemplate.find('input')
    //     .prop('name', 'candidate')
    //     .prop('value', candidateID)
    //     .on('change', async function() {
    //       // When the radio button is changed
    //       const candidateId = $(this).prop('value');
    //       console.log('Radio button clicked for candidate ID:', candidateId);
    //       // Vote for the candidate
    //       await App.vs.vote(candidateId);
    //       console.log('Vote counted for candidate ID:', candidateId);
    //       // Clear the previously selected candidate
    //       $candidateList.find('input:checked').prop('checked', false);
    //       // Mark the newly selected candidate as checked
    //       $(this).prop('checked', true);
    //     });
  
    //   $candidateList.append($newcandidateTemplate.html());
    //   $candidateList.append($('<br>'));
    // }
  },

  logVoterId: async (event) => {
    event.preventDefault();
const voterIdInput = document.getElementById('voterId');
const voterId = voterIdInput.value;
localStorage.setItem('vID', voterId);
console.log('Voter ID:', voterId);
try {
  const tx = await App.vs.register(voterId, { from: App.account });
  alert('Registered Successfully');
  window.location.href = 'pagetwo.html';
} catch (error) {
  if (error.message.includes("MetaMask Tx Signature: User denied transaction signature.")) {
    alert('Already Registered! If you failed to place your vote, contact Admin');

  } else if (error.message.includes("Request of type 'transaction' already pending")) {
    alert('Another transaction is already pending. Please wait and try again.');
  } else {
    alert("Unable to resolve errors. Try again later.", error);
  }
}
},
 
getVote: async (event) => {
  event.preventDefault(); // Prevent the form from submitting

  const candidateIdinput= document.getElementById('Candidateid');
   const candidateId = candidateIdinput.value;
     const voterId = localStorage.getItem('vID');
  console.log(voterId);
   try {
    const candidate = await App.vs.candidates(candidateId);
  //  console.log("before vote: ",candidate[3].toNumber())
  await App.vs.vote(candidateId,voterId,{ from: App.account });
  // console.log("after vote: ",candidate[3].toNumber())
  alert("your vote was successfully recorded in the blockchain!");
  

}catch (error) {
  alert("Suspecting malpractice. Contact admid to submit vote", error);
}
  // // Do something with the candidateId value
  // console.log('Candidate ID: ' + candidateId);
},

displayCandidates: async () => {
  const candidateTableBody = document.getElementById('candidateTableBody');
  candidateTableBody.innerHTML = '';

  const numCandidates = await App.vs.numCandidates();
  for (let i = 0; i < numCandidates; i++) {
       const candidate = await App.vs.candidates(i);
      const candidateId = candidate[0].toNumber();
       const candidateName = candidate[1];
      const candidateParty = candidate[2];
      console.log(candidateId,candidateName,candidateParty);
      const row = document.createElement('tr');
       const idCell = document.createElement('td');
      const nameCell = document.createElement('td');
        const partyCell = document.createElement('td');

      idCell.textContent = candidateId;
      nameCell.textContent = candidateName;
      partyCell.textContent = candidateParty;

      row.appendChild(idCell);
       row.appendChild(nameCell);
      row.appendChild(partyCell);

      candidateTableBody.appendChild(row);
  }
},
// ...

displayElectionResult: async () => {
  const candidateCount = await App.vs.numCandidates();
  console.log(candidateCount)
  let maxVotes = 0;
  let winner = null;

  // Find the candidate with the most votes
  for (let i = 0; i < candidateCount; i++) {
    const candidate = await App.vs.candidates(i);
    const voteCount = candidate.voteCount.toNumber();
    console.log(candidate,voteCount)
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      winner = candidate;
    }
  }

  if (winner) {
    const resultText = `Winner: ${winner.name} (${winner.party}) - Votes: ${maxVotes}`;
    document.getElementById('resultText').textContent = resultText;
  } else {
    document.getElementById('resultText').textContent = 'No votes recorded yet';
  }
  console.log(maxVotes,winner)
},

// ...


  
  // createTask: async () => {
  //   App.setLoading(true)
  //   const content = $('#newTask').val()
  //   await App.todoList.createTask(content)
  //   window.location.reload()
  // },

  // toggleCompleted: async (e) => {
  //   App.setLoading(true)
  //   const taskId = e.target.name
  //   await App.todoList.toggleCompleted(taskId)
  //   window.location.reload()
  // },

  // setLoading: (boolean) => {
  //   App.loading = boolean
  //   const loader = $('#loader')
  //   const content = $('#content')
  //   if (boolean) {
  //     loader.show()
  //     content.hide()
  //   } else {
  //     loader.hide()
  //     content.show()
  //   }
  // }

}

// window.addEventListener('load', async () => {
//   const currentPage = window.location.pathname;
//   if (currentPage === '/pagetwo.html') {
//     await App.displayCandidates();
//   }
// });

$(() => {
  $(window).load(() => {
    App.load()
  })
})