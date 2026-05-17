import * as acme from "acme-client";

export type CertificateRequest = {
  domain: string;
  email: string;
  accountKeyPem: string;
};

export async function createCertificateCsr(domain: string): Promise<{ key: string; csr: string }> {
  const [key, csr] = await acme.crypto.createCsr({
    commonName: domain,
    altNames: [domain]
  });
  return { key: key.toString(), csr: csr.toString() };
}

export function dnsVerificationRecord(domain: string): { name: string; type: "TXT"; valueHint: string } {
  return {
    name: `_acme-challenge.${domain}`,
    type: "TXT",
    valueHint: "Ruby Panel will show the exact ACME challenge token when an order is created."
  };
}
