import { describe, it, expect, beforeEach } from 'vitest';
import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  stringAsciiCV,
  uintCV,
  TxBroadcastResult
} from '@stacks/transactions';
import { STACKS_MOCKNET } from "@stacks/network";

import * as fs from 'fs';
import * as path from 'path';

describe('OjaArt Contract Tests', () => {
  const network = new STACKS_MOCKNET();
  
  // Test accounts
  const deployer = {
    address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    secretKey: 'e63ef893d0b13253e6b5929d97ff9a76a604f954e63bf8d434463247da092658'
  };
  
  const buyer = {
    address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    secretKey: '6a1a754ba863d7bab14adbbc3f8ebb090af9e871ace621d3e5ab634e1422885e'
  };
  
  const testData = {
    ipfsHash: "QmTest123456789012345678901234567890123456789012345678901234567890",
    name: "Test Art",
    description: "This is a test pixel art piece",
    price: 1000000
  };

  beforeEach(async () => {
    // Read and deploy contract before each test
    const contractPath = path.join(__dirname, '../contracts/oja-art.clar');
    const contractSource = fs.readFileSync(contractPath).toString();
    
    const deployTx = await makeContractDeploy({
      contractName: 'oja-art',
      codeBody: contractSource,
      senderKey: deployer.secretKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    });

    await broadcastTransaction(deployTx, network);
  });

  // Helper function to make contract calls
  async function callContract(
    functionName: string,
    args: any[], 
    sender: typeof deployer
  ): Promise<TxBroadcastResult> {
    const tx = await makeContractCall({
      contractAddress: deployer.address,
      contractName: 'oja-art',
      functionName,
      functionArgs: args,
      senderKey: sender.secretKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow
    });

    return broadcastTransaction(tx, network);
  }

  describe('create-pixel-art', () => {
    it('should successfully create a new pixel art', async () => {
      const result = await callContract(
        'create-pixel-art',
        [
          stringAsciiCV(testData.ipfsHash),
          stringAsciiCV(testData.name),
          stringAsciiCV(testData.description)
        ],
        deployer
      );

      expect(result.txId).toBeTruthy();
    });

    it('should fail with invalid input', async () => {
      try {
        await callContract(
          'create-pixel-art',
          [
            stringAsciiCV(""),
            stringAsciiCV(testData.name),
            stringAsciiCV(testData.description)
          ],
          deployer
        );
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error.toString()).toContain('err-invalid-input');
      }
    });
  });

  describe('list-pixel-art', () => {
    it('should successfully list art for sale', async () => {
      // First create the art
      await callContract(
        'create-pixel-art',
        [
          stringAsciiCV(testData.ipfsHash),
          stringAsciiCV(testData.name),
          stringAsciiCV(testData.description)
        ],
        deployer
      );

      // Then list it
      const result = await callContract(
        'list-pixel-art',
        [
          uintCV(1),
          uintCV(testData.price)
        ],
        deployer
      );

      expect(result.txId).toBeTruthy();
    });

    it('should fail when listing non-existent art', async () => {
      try {
        await callContract(
          'list-pixel-art',
          [
            uintCV(999),
            uintCV(testData.price)
          ],
          deployer
        );
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error.toString()).toContain('err-not-found');
      }
    });
  });

  describe('buy-pixel-art', () => {
    it('should successfully buy listed art', async () => {
      // Setup: Create and list art
      await callContract(
        'create-pixel-art',
        [
          stringAsciiCV(testData.ipfsHash),
          stringAsciiCV(testData.name),
          stringAsciiCV(testData.description)
        ],
        deployer
      );

      await callContract(
        'list-pixel-art',
        [
          uintCV(1),
          uintCV(testData.price)
        ],
        deployer
      );

      // Buy the art
      const result = await callContract(
        'buy-pixel-art',
        [uintCV(1)],
        buyer
      );

      expect(result.txId).toBeTruthy();
    });

    it('should fail when buying unlisted art', async () => {
      try {
        await callContract(
          'buy-pixel-art',
          [uintCV(1)],
          buyer
        );
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error.toString()).toContain('err-not-listed');
      }
    });
  });

  describe('read-only functions', () => {
    it('should get pixel art details', async () => {
      // First create the art
      await callContract(
        'create-pixel-art',
        [
          stringAsciiCV(testData.ipfsHash),
          stringAsciiCV(testData.name),
          stringAsciiCV(testData.description)
        ],
        deployer
      );

      const tx = await makeContractCall({
        contractAddress: deployer.address,
        contractName: 'oja-art',
        functionName: 'get-pixel-art',
        functionArgs: [uintCV(1)],
        senderKey: deployer.secretKey,
        network,
        anchorMode: AnchorMode.Any
      });

      const result = await broadcastTransaction(tx, network);
      expect(result.txId).toBeTruthy();
    });

    it('should get artist stats', async () => {
      const tx = await makeContractCall({
        contractAddress: deployer.address,
        contractName: 'oja-art',
        functionName: 'get-artist-stats',
        functionArgs: [standardPrincipalCV(deployer.address)],
        senderKey: deployer.secretKey,
        network,
        anchorMode: AnchorMode.Any
      });

      const result = await broadcastTransaction(tx, network);
      expect(result.txId).toBeTruthy();
    });
  });
});