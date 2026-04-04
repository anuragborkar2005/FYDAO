import CampaignFactory from "@/contracts/abis/CampaignFactory.json";
import DAOGovernor from "@/contracts/abis/DAOGovernor.json";
import GovernanceToken from "@/contracts/abis/GovernanceToken.json";
import MockUSDC from "@/contracts/abis/MockUSDC.json";
import Campaign from "@/contracts/abis/Campaign.json";
import MilestoneEscrow from "@/contracts/abis/MilestoneEscrow.json";

export const CONTRACT_ADDRESSES = {
    CampaignFactory: "0xceC9DEB423b1D5Ab1fd2798ba5331845723674B0",
    DAOGovernor: "0x442107614248A2E5c6d8FAd39860787296eC0891",
    GovernanceToken: "0x9C432370c9A6f7B41f74e4d55B8c019A09BE834B",
    MockUSDC: "0x931A036628AC40Fa43FDa3d65319163768cb97c7",
    Timelock: "0xd82b8cc00E9A2C23C1C5921C1b999d0901d8CDAD",
} as const;

export const ABIS = {
    CampaignFactory: CampaignFactory.abi,
    DAOGovernor: DAOGovernor.abi,
    GovernanceToken: GovernanceToken.abi,
    MockUSDC: MockUSDC.abi,
    Campaign: Campaign.abi,
    MilestoneEscrow: MilestoneEscrow.abi,
};

export type ChainId = keyof typeof CONTRACT_ADDRESSES;
