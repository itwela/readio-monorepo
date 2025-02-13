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
    Text
} from "@react-email/components";

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


const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
: '';

interface EmailTemplateProps {
    email: string
}

const logoUrl = `${baseUrl}/giant-steps-logo-white.png`;

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
        <Preview>Welcome to GIANT STEPS! You&apos;re Ahead of the Game 👣</Preview>

        <Body style={{...main, padding: 0, margin: 0}}>
            <Container style={{...main, padding: "10px", }}>
                <Container style={container}>
                    {/* Header Navigation */}
                    <Row>
                        <Column style={headerStyle}>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                <Text style={headerLink}>
                                    <a target="_blank"  style={resetLinkStyles} href="https://thelotusapp.com">
                                        App
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
                        <Column style={{...colPadding, paddingBottom: 0,}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', }}>
                                <Img
                                    src={logoUrl}
                                    width="40"
                                    height="40"
                                    alt="Giant Steps"
                                />
                                <Text style={{ fontSize: 20, color: colors.readioWhite, margin: 0, fontWeight: "bold" }}>
                                    Lotus
                                </Text>
                            </div>
                        </Column>
                    </Row>

                    {/* Main Content */}
                    <Row>
                        <Column style={{...colPadding, paddingTop: 5}}>
                            <Text style={subHeadingWhite}>
                                Hey {email},
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
            <Row style={{backgroundColor: colors.readioBrown, maxWidth: "600px"}}>
                <Column style={footerStyle}>
                    <Text style={signatureWhite}>
                        GIANT STEPS
                    </Text>
                    <Text style={hashtagsWhite}>
                        #EveryStepCounts | #LotusGIANTSTEPS
                    </Text>
                    <div style={{ display: 'flex', justifyContent: "flex-end", alignItems: 'center', gap: '5px', }}>
                        <Img
                            src={logoUrl}
                            width="20"
                            height="20"
                            alt="Giant Steps"
                        />
                        <Text style={{ fontSize: 10, color: colors.readioWhite, margin: 0, fontWeight: 'bold' }}>
                            Lotus
                        </Text>
                    </div>
                </Column>
            </Row>

        </Body>
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
    border: `1px solid ${colors.readioBlack}20`,
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
