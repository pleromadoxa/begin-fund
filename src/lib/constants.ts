import type { Tier } from "./types";

export const CHURCH_YEARS = ["0-2 years", "3-5 years", "6-10 years", "10 years +"];

export const FOUNDATION_SCHOOL = ["Yes", "No", "Currently Enrolled"];

export const INDUSTRIES = [
  "Technology and Digital Services",
  "Agribusiness and Agriculture",
  "Food and Hospitality",
  "Professional Services",
  "Fashion and Beauty",
  "Health",
  "Transport and Logistics",
  "Trading",
  "Other",
];

export const TIER_INFO: Record<
  Tier,
  {
    title: string;
    tagline: string;
    description: string;
    turnover: string;
    fundingRange: string;
    documents: string[];
  }
> = {
  1: {
    title: "Tier 1",
    tagline: "Startup / Early-Stage Business",
    description:
      "A new business; a business in its first year or a business owner with limited trading history.",
    turnover: "Annual turnover up to GHS 100,000.00",
    fundingRange: "GHS 10,000.00 to GHS 50,000.00",
    documents: [
      "Business registration documents (if applicable)",
      "Valid ID",
      "Basic startup budget",
      "One-page business plan",
      "Summary of outstanding loans / business repayments",
    ],
  },
  2: {
    title: "Tier 2",
    tagline: "Growing SME",
    description:
      "A business with an established customer base; recurring sales and evidence of operational activity.",
    turnover: "Annual turnover between GHS 100,001.00 and GHS 250,000.00",
    fundingRange: "GHS 50,001.00 to GHS 100,000.00",
    documents: [
      "Business registration documents",
      "Basic income and expense statement",
      "Sales records and/or transaction summaries for the last 3 months",
      "Summary of outstanding loans / business repayments",
      "Business plan / pitch deck",
      "Ownership structure",
    ],
  },
  3: {
    title: "Tier 3",
    tagline: "Established Business",
    description:
      "A mature business with sustained trading and growth history; documented financials and formal operating systems.",
    turnover: "Annual turnover over GHS 250,000.00",
    fundingRange: "GHS 100,000.00 and above",
    documents: [
      "Business registration documents",
      "Ownership structure",
      "Financial statements or management accounts for the last 2 years",
      "Tax records",
      "Business plan / investor proposal",
      "Invoices or contracts supporting the proposed use of funds",
      "Summary of outstanding loans / business repayments",
    ],
  },
};

export const REPAYMENT_PERIODS = ["1-3 months", "3-6 months", "Other (subject to approval)"];

export const REPAYMENT_MODES = ["Weekly", "Monthly", "Other (subject to approval)"];

export const DECLARATIONS = [
  "I confirm that the information provided is accurate and complete to the best of my knowledge.",
  "I confirm that the requested funds will be used for the stated business purpose.",
  "I understand that this is a zero interest loan and no processing fee is included.",
  "I confirm that I must repay the principal according to the agreed schedule.",
  "I understand that this submission does not guarantee approval or the disbursement of funds.",
  "I confirm that I willingly provided all supporting documents and consent for the committee to approve my documents.",
  "I confirm that I will inform the committee promptly of any significant changes which affects my business and/or ability to pay.",
  "I understand that my information will be handled confidentially.",
  "I understand that my position or personal relationships should not determine the outcome of my application.",
  "I understand that none of the committee members can act as a guarantor for my application.",
  "I understand that the committee does not determine the bank's fees and charges. The committee is only responsible for reviewing, interviewing and approving applications for onward submission to the bank for the disbursement of funds.",
  "Upon approval, I agree to fully participate in the mandatory business clinic.",
];

export const FUND_TERMS = [
  { label: "Interest rate", value: "0%" },
  { label: "Loan term", value: "Up to 6 months" },
  { label: "Repayment", value: "Principal only" },
  { label: "Disbursement", value: "Ecobank account only" },
];
