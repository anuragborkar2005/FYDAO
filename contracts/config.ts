import CampaignFactory from "@/contracts/abis/CampaignFactory.json"
import DAOGovernor from "@/contracts/abis/DAOGovernor.json"
import GovernanceToken from "@/contracts/abis/GovernanceToken.json"
import MockUSDC from "@/contracts/abis/MockUSDC.json"
import Campaign from "@/contracts/abis/Campaign.json"
import MilestoneEscrow from "@/contracts/abis/MilestoneEscrow.json"
import { Abi } from "viem"

export const CONTRACT_ADDRESSES = {
  CampaignFactory: "0xceC9DEB423b1D5Ab1fd2798ba5331845723674B0",
  DAOGovernor: "0x442107614248A2E5c6d8FAd39860787296eC0891",
  GovernanceToken: "0x9C432370c9A6f7B41f74e4d55B8c019A09BE834B",
  MockUSDC: "0x931A036628AC40Fa43FDa3d65319163768cb97c7",
  Timelock: "0xd82b8cc00E9A2C23C1C5921C1b999d0901d8CDAD",
} as const

export const ABIS = {
  CampaignFactory: CampaignFactory.abi as Abi,
  DAOGovernor: DAOGovernor.abi as Abi,
  GovernanceToken: GovernanceToken.abi as Abi,
  MockUSDC: MockUSDC.abi as Abi,
  Campaign: Campaign.abi as Abi,
  MilestoneEscrow: MilestoneEscrow.abi as Abi,
}

export type ChainId = keyof typeof CONTRACT_ADDRESSES

export const TOKEN_DECIMALS = {
  USDC: 6,
  GovernanceToken: 6, // Matches MockUSDC as it's likely a wrapped version
} as const
