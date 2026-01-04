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

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
}

interface NewToolsNotificationProps {
  tools: Tool[];
  unsubscribeUrl: string;
}

export function NewToolsNotification({
  tools,
  unsubscribeUrl,
}: NewToolsNotificationProps) {
  const toolCount = tools.length;
  const previewText =
    toolCount === 1
      ? `New tool added: ${tools[0]?.name}`
      : `${toolCount} new tools added to Awesome Intune`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Awesome Intune</Heading>
          <Text style={paragraph}>
            {toolCount === 1
              ? "A new tool has been added to Awesome Intune!"
              : `${toolCount} new tools have been added to Awesome Intune!`}
          </Text>

          {tools.map((tool) => (
            <Section key={tool.id} style={toolCard}>
              <Text style={toolName}>{tool.name}</Text>
              <Text style={toolMeta}>
                {tool.category} | by {tool.author}
              </Text>
              <Text style={toolDescription}>{tool.description}</Text>
            </Section>
          ))}

          <Section style={buttonContainer}>
            <Button style={button} href="https://awesomeintune.com">
              View All Tools
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You are receiving this email because you signed up for Awesome
            Intune notifications.
            <br />
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe
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

const toolCard = {
  backgroundColor: "#171717",
  borderRadius: "8px",
  border: "1px solid #262626",
  padding: "20px",
  margin: "16px 0",
};

const toolName = {
  color: "#00d4ff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const toolMeta = {
  color: "#737373",
  fontSize: "14px",
  margin: "0 0 12px",
};

const toolDescription = {
  color: "#a3a3a3",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
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
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "20px",
};

const unsubscribeLink = {
  color: "#737373",
  textDecoration: "underline",
};

export default NewToolsNotification;
