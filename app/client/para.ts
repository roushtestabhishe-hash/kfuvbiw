'use client'
import { Environment, ParaWeb } from "@getpara/react-sdk";

const API_KEY = "cbaab0dbc16b98e540bb4b6d5322c6f1";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const para = new ParaWeb(Environment.PROD, API_KEY);
