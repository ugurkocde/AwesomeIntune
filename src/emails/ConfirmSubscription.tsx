import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmSubscriptionProps {
  confirmUrl: string;
}

export function ConfirmSubscription({ confirmUrl }: ConfirmSubscriptionProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your email to get notified about new Intune tools</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Awesome Intune</Heading>
          <Text style={paragraph}>
            Thanks for signing up for Awesome Intune notifications!
          </Text>
          <Text style={paragraph}>
            Please confirm your email address by clicking the button below.
            Once confirmed, you will receive free updates whenever new
            community tools are added to our collection.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={confirmUrl}>
              Confirm Email Address
            </Button>
          </Section>
          <Text style={secondaryText}>
            This is a free service - you can unsubscribe at any time.
          </Text>
          <Text style={paragraph}>
            If you did not sign up for Awesome Intune, you can safely ignore
            this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href="https://awesomeintune.com" style={link}>
              Awesome Intune
            </Link>{" "}
            - A community-curated collection of Microsoft Intune tools
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

const secondaryText = {
  color: "#737373",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
  textAlign: "center" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#00d4ff",
  borderRadius: "8px",
  color: "#0a0a0a",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
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

export default ConfirmSubscription;
