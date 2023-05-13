// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract VotingSystem {

    uint public totalVotes;
    address public owner;
    bool public votingOpen;
    uint public candidateCount=0;

    struct Candidate {
        uint id;
	string name;
        string party;
        uint vote;
    }

    struct Voter {
        bytes32 hashedPassword;
        bool voted;
        address delegate;
        uint candidateIndex;
    }

    mapping (bytes32 => Voter) public voters;
    Candidate[] public candidates;
    bytes32[] public voterIds;

    bytes32 public merkleRoot;
    mapping (bytes32 => bool) public usedNonces;

    constructor(string[] memory _names, string[] memory _parties, bytes32[] memory _voterIds, bytes32 _merkleRoot) {
        owner = msg.sender;
        merkleRoot = _merkleRoot;

        for (uint i = 0; i < _names.length; i++) {
            candidates.push(Candidate(_names[i], _parties[i], 0));
        }

        for (uint i = 0; i < _voterIds.length; i++) {
            bytes32 hashedPassword = keccak256(abi.encodePacked(_voterIds[i], "password"));
            voters[_voterIds[i]] = Voter(hashedPassword, false, address(0), 0);
            voterIds.push(_voterIds[i]);
        }
    }

    function addCandidate(string memory _name, string memory _party) external {
        require(msg.sender == owner, "Only the contract owner can add candidates");
        require(votingOpen, "Voting is closed");
	candidateCount ++;
        candidates.push(Candidate(candidateCount,_name, _party, 0));
	
    }

    function openVoting() external {
        require(msg.sender == owner, "Only the contract owner can open voting");
        require(!votingOpen, "Voting is already open");

        votingOpen = true;
    }

    function closeVoting() external {
        require(msg.sender == owner, "Only the contract owner can close voting");
        require(votingOpen, "Voting is already closed");

        votingOpen = false;
    }

    function getWinner() external view returns (string memory, string memory, uint) {
        require(!votingOpen, "Voting is still open");

        uint maxVotes = 0;
        uint winningIndex = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winningIndex = i;
            }
        }

        return (candidates[winningIndex].name, candidates[winningIndex].party, candidates[winningIndex].voteCount);
    }

    function vote(bytes32 _voterId, uint _candidateIndex, bytes32[] calldata _proof, bytes32 _nonce) external {
        require(votingOpen, "Voting is not open");
        require(!voters[_voterId].voted, "Voter has already voted");
        require(verifyProof(_voterId, _proof), "Invalid proof");
        require(!usedNonces[_nonce], "Nonce has already been used");
        usedNonces[_nonce] = true;

        voters[_voterId].voted = true;
        voters[_voterId].candidateIndex = _candidateIndex;
        candidates[_candidateIndex].voteCount++;
        totalVotes++;
    }

    function getVoter(bytes32 _voterId) external view returns (bytes32, bool, address, uint) {
        return     (voters[_voterId].hashedPassword, voters[_voterId].voted, voters[_voterId].delegate, voters[_voterId].candidateIndex);
}

function getCandidate(uint _candidateIndex) external view returns (string memory, string memory, uint) {
    return (candidates[_candidateIndex].name, candidates[_candidateIndex].party, candidates[_candidateIndex].voteCount);
}

function verifyProof(bytes32 _voterId, bytes32[] calldata _proof) internal view returns (bool) {
    bytes32 hash = keccak256(abi.encodePacked(_voterId));
    bytes32 el;

    for (uint i = 0; i < _proof.length; i++) {
        el = _proof[i];

        if (hash < el) {
            hash = keccak256(abi.encodePacked(hash, el));
        } else {
            hash = keccak256(abi.encodePacked(el, hash));
        }
    }

    return hash == merkleRoot;
}

function startVoting() external onlyOwner {
    require(!votingOpen, "Voting has already started");
    votingOpen = true;
}

function closeVoting() external onlyOwner {
    require(votingOpen, "Voting is already closed");
    votingOpen = false;
}

function displayResult() external view onlyOwner returns (string[] memory, uint[] memory) {
    require(!votingOpen, "Voting is not closed yet");

    uint numCandidates = candidates.length;
    string[] memory names = new string[](numCandidates);
    uint[] memory voteCounts = new uint[](numCandidates);

    for (uint i = 0; i < numCandidates; i++) {
        names[i] = candidates[i].name;
        voteCounts[i] = candidates[i].voteCount;
    }

    return (names, voteCounts);
}

