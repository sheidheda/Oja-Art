import { Chain } from '@stacks/transactions';
import { StacksMocknet } from '@stacks/network';

// Setup mock accounts
export const DEPLOYER_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
export const BUYER_ADDRESS = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

// Initialize network and chain
export const network = new StacksMocknet();
export const chain = new Chain(network);

// Helper to deploy contract before tests
export const deployContract = async () => {
  const contractSource = '...'; // You'll need to read your contract source here
  const result = await chain.deployContract('oja-art', contractSource, DEPLOYER_ADDRESS);
  return result;
};

// Reset chain state before each test
beforeEach(async () => {
  await chain.clearState();
});