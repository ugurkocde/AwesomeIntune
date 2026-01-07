import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  CodeInline,
} from "@react-email/components";

interface ApiKeyEmailProps {
  name: string;
  apiKey: string;
}

export function ApiKeyEmail({ name, apiKey }: ApiKeyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Awesome Intune API key is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Awesome Intune API</Heading>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Your API key for the Awesome Intune API has been created. Use this
            key to access our collection of Microsoft Intune tools
            programmatically.
          </Text>

          <Section style={codeContainer}>
            <Text style={codeLabel}>Your API Key:</Text>
            <Text style={codeBlock}>
              <CodeInline style={code}>{apiKey}</CodeInline>
            </Text>
          </Section>

          <Text style={warningText}>
            Keep this key secure and do not share it publicly. If compromised,
            you can request a new key from the developer portal.
          </Text>

          <Section style={usageSection}>
            <Text style={sectionTitle}>Quick Start</Text>
            <Text style={codeBlock}>
              <CodeInline style={code}>
                curl -H &quot;X-API-Key: {apiKey}&quot; \{"\n"}
                {"  "}https://awesomeintune.com/api/v1/tools
              </CodeInline>
            </Text>
          </Section>

          <Section style={limitsSection}>
            <Text style={sectionTitle}>Rate Limits</Text>
            <Text style={paragraph}>
              Your free tier includes 1,000 requests per day. Limits reset at
              midnight UTC.
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            <Link href="https://awesomeintune.com/developers" style={link}>
              API Documentation
            </Link>
            {" | "}
            <Link href="https://awesomeintune.com" style={link}>
              Awesome Intune
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading = {
  color: "#00d4ff",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 30px",
};

const paragraph = {
  color: "#e5e5e5",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const codeContainer = {
  backgroundColor: "#171717",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const codeLabel = {
  color: "#737373",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const codeBlock = {
  margin: "0",
  padding: "0",
};

const code = {
  backgroundColor: "transparent",
  color: "#00d4ff",
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

const warningText = {
  color: "#fbbf24",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
  padding: "12px",
  backgroundColor: "rgba(251, 191, 36, 0.1)",
  borderRadius: "6px",
  borderLeft: "3px solid #fbbf24",
};

const usageSection = {
  margin: "24px 0",
};

const limitsSection = {
  margin: "24px 0",
};

const sectionTitle = {
  color: "#e5e5e5",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const hr = {
  borderColor: "#262626",
  margin: "32px 0",
};

const footer = {
  color: "#737373",
  fontSize: "14px",
  textAlign: "center" as const,
};

const link = {
  color: "#00d4ff",
  textDecoration: "none",
};

export default ApiKeyEmail;
