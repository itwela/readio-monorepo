import {
    Body,
    Button,
    Column,
    Container,
    Font,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Row,
    Tailwind,
    Text,
    Section
} from "@react-email/components";
import React from "react";

const colors = {
    primary: '#fc3c44',
    background: '#000',
    text: '#000',
    textMuted: '#9ca3af',
    icon: "#2F2B2A",
    minimumTrackTintColor: "#2F2B2A",
    maximumTrackTintColor: '#DB581A',
    readioBrown: '#272121',
    readioWhite: '#E9E0C1',
    readioBlack: '#2F2B2A',
    readioOrange: '#DB581A',
    readioDustyWhite: "#DAD2B6"
}



interface EmailTemplateProps {
    email: string
}

export const GiantStepsWelcomeEmail = ({
    email,
}: EmailTemplateProps) => (
    <Html>
        <Head>

            <Font
                fontFamily="Montserrat"
                fallbackFontFamily="Verdana"
                webFont={{
                    url: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXp-p7K4KLg.woff2",
                    format: "woff2",
                }}
                fontWeight={400}
                fontStyle="normal"
            />
            <Font
                fontFamily="Montserrat"
                fallbackFontFamily="Verdana"
                webFont={{
                    url: "https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aXp-p7K4KLg.woff2",
                    format: "woff2",
                }}
                fontWeight={700}
                fontStyle="normal"
            />

        </Head>
        <Tailwind>
            <Preview>Welcome to GIANT STEPS! You&apos;re Ahead of the Game 👣</Preview>

            <Body style={{ ...main, padding: 0, margin: 0 }}>
                <Container style={{ ...main, padding: "10px", }}>
                    <Container style={container}>
                        {/* Header Navigation */}
                        <Row>
                            <Column style={headerStyle}>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <Text style={headerLink}>
                                        <a target="_blank" style={resetLinkStyles} href="https://thelotusapp.com">
                                            App
                                        </a>
                                    </Text>
                                    <Text style={{ ...headerLink, color: "transparent", fontSize: 1 }}>
                                        <a target="_blank" style={resetLinkStyles} href="https://thelotusapp.com">
                                            itwela
                                        </a>
                                    </Text>
                                    <Text style={headerLink}>
                                        <a target="_blank" style={resetLinkStyles} href="https://thelotusapp.com">
                                            Community
                                        </a>
                                    </Text>
                                    {/* <Text style={headerLink}>Support</Text> */}
                                </div>
                            </Column>
                        </Row>

                        {/* Logo Section */}
                        <Row>
                            <Column style={{ ...colPadding, padding: 2, paddingBottom: 0 }}>
                                <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                                    <tr>
                                        <td style={{ padding: '5px' }}>
                                            <Img
                                                src={'https://companystaticimages.s3.us-east-2.amazonaws.com/ltus+final-03.png'}
                                                width="50"
                                                height="50"
                                                alt="Giant Steps"
                                            />
                                        </td>
                                        <td style={{ padding: '5px 0px' }}>
                                            <Text style={{ fontSize: 15, transform: 'translateX(-25%)', color: colors.readioWhite, margin: 0, fontWeight: "bold" }}>
                                                Lotus
                                            </Text>
                                        </td>
                                    </tr>
                                </table>
                            </Column>
                        </Row>

                        {/* Main Content */}
                        <Row>
                            <Column style={{ ...colPadding, paddingTop: 5 }}>
                                <Text style={subHeadingWhite}>
                                    Hey <a style={resetLinkStyles} className="">
                                            {email}
                                        </a>
                                </Text>
                                <Heading style={mainHeadingWhite}>
                                    You just took your first step toward something BIG!
                                </Heading>
                            </Column>
                        </Row>

                        {/* Main Message Card */}
                        <Row>
                            <Column style={messageCardStyle}>
                                <Text style={paragraph}>
                                    Welcome to the <strong>GIANT STEPS Early Bird List!</strong>
                                </Text>
                                <Text style={paragraph}>
                                    We&apos;re going to make history together!
                                </Text>
                                <Text style={paragraph}>
                                    We&apos;re lacing up our last little odds and ends before we launch, and you&apos;ll be one of the founding first to receive the exclusive link to the <strong>Lotus Always Growing app</strong> when we hit the ground running!
                                </Text>
                                <Text style={paragraph}>
                                    That means you&apos;ll be ahead of the pack, tracking your steps, unlocking challenges, and stacking up wins before anyone else.
                                </Text>
                                <Text style={paragraph}>
                                    <strong>So be on the lookout for our email for next steps soon!</strong>
                                </Text>
                                <Container style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <Button style={ctaButton}>
                                        Let&apos;s get it.
                                    </Button>
                                </Container>
                            </Column>
                        </Row>

                    </Container>
                </Container>

                {/* Footer Section */}
                <Column style={{ backgroundColor: colors.readioBrown, maxWidth: "600px" }}>
                    <Section style={footerStyle}>
                        <Text style={signatureWhite}>
                            GIANT STEPS
                        </Text>
                        <Text style={hashtagsWhite}>
                            #EveryStepCounts | #LotusGIANTSTEPS
                        </Text>
                    </Section>
                    <Section style={{ ...colPadding, padding: 2, paddingBottom: 0 }}>
                            <table style={{ borderCollapse: 'collapse', textAlign: 'center' }}>
                                <tr>
                                    <td style={{ padding: '5px' }}>
                                        <Img
                                            src={'https://companystaticimages.s3.us-east-2.amazonaws.com/ltus+final-03.png'}
                                            width="50"
                                            height="50"
                                            alt="Giant Steps"
                                        />
                                    </td>
                                    <td style={{ padding: '5px 0px' }}>
                                        <Text style={{ fontSize: 15, transform: 'translateX(-25%)', color: colors.readioWhite, margin: 0, fontWeight: "bold" }}>
                                            Lotus
                                        </Text>
                                    </td>
                                </tr>
                            </table>
                    </Section>
                </Column>

            </Body>
        </Tailwind>
    </Html>
);

const main = {
    backgroundColor: colors.readioOrange,
    fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
};

const container = {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: colors.readioOrange,
    border: `2px solid ${colors.readioWhite}20`,
    borderRadius: '8px',
};

const headerStyle = {
    padding: "12px 36px",
    borderBottom: `1px solid ${colors.readioWhite}20`,
};

const headerLink = {
    color: colors.readioWhite,
    fontSize: '14px',
    textDecoration: 'none',
    margin: 0,
};

const colPadding = {
    padding: "20px 36px",
};

const resetLinkStyles = {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    margin: 0,
    outline: 'none'
};


const mainHeadingWhite = {
    fontSize: '32px',
    color: colors.readioWhite,
    marginBottom: '12px',
    fontWeight: 'bold',
};


const subHeadingWhite = {
    fontSize: '18px',
    color: colors.readioWhite,
    marginBottom: '32px',
};

const messageCardStyle = {
    padding: "32px",
    margin: "0 36px",
    backgroundColor: colors.readioWhite,
    border: `1px solid ${colors.readioWhite}20`,
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
};
const paragraph = {
    color: colors.readioBlack,
    fontSize: '16px',
    lineHeight: '24px',
    margin: '16px 0',
};

const ctaButton = {
    backgroundColor: colors.readioOrange,
    color: colors.readioWhite,
    padding: '12px 24px',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '24px',
};

const footerStyle = {
    padding: "32px 36px",
    textAlign: 'center' as const,
    borderTop: `1px solid ${colors.readioBlack}20`,
    width: "100%"
};


const signatureWhite = {
    color: colors.readioWhite,
    fontSize: '18px',
    fontWeight: 700,
};


const hashtagsWhite = {
    color: colors.readioWhite,
    fontSize: '10px',
    marginTop: '12px',
};


export default GiantStepsWelcomeEmail;
