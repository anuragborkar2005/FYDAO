import CampaignFactory from "@/contracts/abis/CampaignFactory.json"
import DAOGovernor from "@/contracts/abis/DAOGovernor.json"
import GovernanceToken from "@/contracts/abis/GovernanceToken.json"
import MockUSDC from "@/contracts/abis/MockUSDC.json"
import Campaign from "@/contracts/abis/Campaign.json"
import MilestoneEscrow from "@/contracts/abis/MilestoneEscrow.json"
import { Abi } from "viem"

export const CONTRACT_ADDRESSES = {
  CampaignFactory: "0xceBF8C35fD0D1F87F0c726295a7ad417B485a980",
  DAOGovernor: "0x47c8f9aF1B84a2063795d958D036dF92Be3bE249",
  GovernanceToken: "0x190b2Bf071f47000A9606281ed54fE210CC8905a",
  MockUSDC: "0x54aEd5Cd828fc8c7b31f8285Be753074EDc7E915",
  Timelock: "0x4Cf8E13e6a3db1663F0Eb3DE67B979bC7e3d1E0A",
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
