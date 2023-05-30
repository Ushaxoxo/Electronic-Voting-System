// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;
contract VotingSystem {
    // The number of candidates and voters
    // uint constant treeLevels = 7; // Merkle tree levels
    // uint constant treeWidth = 2**treeLevels; // Merkle tree width
    // bytes32[treeWidth] public merkleTree; // Merkle tree represented as an array
    uint public leafnodindex = 15;
    uint public currleafnode=0;
    uint public numCandidates=0;
    uint public numVoters=0;
    bytes32[] public hashes;
     bytes32[] public temp;
    struct Candidate {
        uint id;
	    string name;
        string party;
        uint vote;
    }
    // The list of candidates and registered voters
    Candidate[] public candidates;
    mapping (uint => bool) public voters;
    // The list of vote counts for each candidate
    // mapping (uint => uint) public votes;

    // The Merkle tree root of all votes
    bytes32 public merkleRoot;
    bytes32 public leaf;

    // The mapping of votes to Merkle tree leaves
    mapping (bytes32 => bool) public voteLeaves;


    mapping(uint => bool) public hasVoted;
    // The events emitted by the contract
    event AddCandidate(uint candidateId, string name, string party);
    event RegisterVoter(uint voterid);
    event CastVote(address voter, uint candidateId);

    constructor(string[] memory _candidates,string[] memory _parties,uint[] memory _randomarray )public {
       leafnodindex=_randomarray.length-1;
        numCandidates = _candidates.length;
        for (uint i = 0; i < numCandidates; i++) {
           
            candidates.push(Candidate(i,_candidates[i], _parties[i], 0));
            for (uint j = 0; j < _randomarray.length ; j++) {
                hashes.push(keccak256(abi.encodePacked(_randomarray[i])));
            }    
            uint n = _randomarray.length;
            uint offset = 0;
            while ( n > 0) {
                for( uint k=0;k<n-1;k+=2){
                     hashes.push(keccak256(abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])));  
                }
                 offset+=n;
                n=n/2;
            }
        }

        merkleRoot=getRoot();

    }
     

    function register(uint voterid) public {
        // Register the caller as a voter
        require(!voters[voterid], "Already registered as a voter");
        voters[voterid] = true;
        numVoters++;
        emit RegisterVoter(voterid);
    }

   function vote(uint candidateId, uint voterid) public returns (uint, bytes32) {
    // Make sure the voter is registered and the candidate exists
    require(voters[voterid], "Not registered as a voter");
    require(candidateId < numCandidates, "Invalid candidate");

    // Make sure the voter hasn't voted already
    require(!hasVoted[voterid], "You have already voted.");
    hasVoted[voterid] = true;

    leaf = keccak256(abi.encodePacked(candidateId, voterid));
    candidates[candidateId].vote++;
    if(currleafnode <= leafnodindex)
      {hashes[currleafnode] = leaf;
        currleafnode++;}

    for (uint i = 0; i < leafnodindex+1; i++) {
            temp.push(hashes[i]);
        }

        uint n = leafnodindex+1;
        uint offset = 0;

        while (n > 0) {
            for (uint i = 0; i < n - 1; i += 2) {
                temp.push(keccak256(abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])));
            }
            offset += n;
            n = n / 2;
        }
    for (uint i = 0; i < temp.length; i++) {
    hashes[i] = temp[i];
}
        
    merkleRoot=hashes[hashes.length-1];

    return (currleafnode - 1, leaf);
}


        

function verifyMerkleProof(bytes32 cleaf, bytes32[] memory proof, bytes32 root,uint index) public pure returns (bool) {

    bytes32 hash = cleaf;

    for (uint i = 0; i < proof.length; i++) {
        bytes32 proofElement = proof[i];

        if (index % 2 == 0 ) {
            hash = keccak256(abi.encodePacked(hash,proofElement));
        } else {
            hash = keccak256(abi.encodePacked(proofElement, hash));
        }
        index=index/2;
    }

    return hash == root;
}    

function hashPair(bytes32 left, bytes32 right) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(left, right));
    }

function getRoot() public view returns (bytes32) {
        return hashes[hashes.length - 1];
    }

    function getProof(bytes32 leaf) public view returns (bytes32[] memory) {
    bytes32[] memory proof = new bytes32[](treeLevels);
    uint index = getLeafIndex(leaf);
    require(index>0,"Wrong Entry");
    for (uint i = 0; i < treeLevels; i++) {
        index = index / 2;
        if (index % 2 == 0) {
            proof[i] = hashes[index + 1];
        } else {
            proof[i] = hashes[index - 1];
        }
    }
    return proof;
}

// function getLeafIndex(bytes32 leaf) internal view returns (uint) {
//     for (uint i = 0; i < hashes.length; i++) {
//         if (hashes[i] == leaf) {
//             return (leafnodindex+1) / 2 + i;
//         }
//     }
    
//     revert("Leaf not found in Merkle tree");
// }
    


//  function createMerkleTree() internal {
//         // Create leaf nodes by assigning Keccak256 hash of random values
//         for (uint256 i = (n-1)/2; i < n; i++) {
//             bytes32 leaf = keccak256(abi.encodePacked(i));
//             merkleTree[i ] = leaf;
//         }
//  }


    



function CreateMerkleTree (uint256[] memory array) public {
     for (uint i = 0; i < array.length; i++) {
        hashes.push(array[i]);
    }    
    uint n = array.length;
    uint offset = 0;
    while (  n> 0) {
        for( uint i=0;i<n-1;i+=2){
            hashes.push(keccak256(abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])));  
        }
        offset+=n;
        n=n/2;
    }  
}

}