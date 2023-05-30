// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract VotingSystem {
    struct Candidate {
     uint id;
        string name;
  string party;
        uint voteCount;
    }

    struct Vote {
        uint candidateId;
    uint voterId;
    }

    Candidate[] public candidates;
    mapping(uint => bool) public voters;
    mapping(uint => bool) public hasVoted;
 mapping(uint => Vote) public votes;
    uint public numCandidates = 0;

mapping(uint => uint[]) private graph;

    event AddCandidate(uint candidateId, string name, string party);
event RegisterVoter(uint voterId);
    event CastVote(address voter, uint candidateId);

    constructor(string[] memory candidateNames, string[] memory partyNames) public{
    require(candidateNames.length == partyNames.length, "Mismatch between candidate names and party names");

    for (uint i = 0; i < candidateNames.length; i++) {
        candidates.push(Candidate(i, candidateNames[i], partyNames[i], 0));
        emit AddCandidate(i, candidateNames[i], partyNames[i]);
        numCandidates++;
        }
    }

    function register(uint voterId) public {
    require(!voters[voterId], "Already registered as a voter");
    voters[voterId] = true;
    emit RegisterVoter(voterId);
    }

    function vote(uint candidateId, uint voterId) public {
     require(voters[voterId], "Not registered as a voter");
     require(candidateId < candidates.length, "Invalid candidate");
    require(!hasVoted[voterId], "You have already voted.");

    hasVoted[voterId] = true;
        
    uint voteId = voterId;
    votes[voteId] = Vote(candidateId, voterId);

       graph[candidateId].push(voterId);
        
    candidates[candidateId].voteCount = graph[candidateId].length;

     emit CastVote(msg.sender, candidateId);
    }

    function getElectionResult() public view returns (uint) {
      uint maxVotes = 0;
        uint winningCandidateId;

     for (uint i = 0; i < candidates.length; i++) {
         if (candidates[i].voteCount > maxVotes) {
             maxVotes = candidates[i].voteCount;
        winningCandidateId = candidates[i].id;
        }
        }

        return winningCandidateId;
    }
}
