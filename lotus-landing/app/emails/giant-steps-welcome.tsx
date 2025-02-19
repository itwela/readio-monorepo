import {
    Body,
    Container,
    Font,
    Head,
    Html,
    Img,
    Preview,
    Tailwind,
    Text
} from "@react-email/components";
import React from "react";


interface SingleCenteredContentProps {
    label: string;
    children: React.ReactNode;
}

interface HeaderImgContentProps {
    label: string;
    children: React.ReactNode;
    width: string;
    height: string;
}

interface GapProps {
    height: string | number;
}

const SingleCenteredContent: React.FC<SingleCenteredContentProps> = ({ children }) => {
    return (
        <table style={tableStyle}>
            <tr>
                <td style={tableCellStyle}>
                    {children}
                </td>
            </tr>
        </table>
    );
};

const HeaderImgContent: React.FC<HeaderImgContentProps> = ({ label, children, width, height }) => {
    return (
        <SingleCenteredContent label={label}>
            {/* <> */}
            <div style={{ width: width, height: height, position: "relative" }}>
                {/* Now all you have to do is make the image absolute with a width of full and h of full ans it should just fill the box */}
                {children}
            </div>
            {/* </> */}
        </SingleCenteredContent>
    );
};

const GapComponent: React.FC<GapProps> = ({ height }) => {
    return (
        <table style={tableStyle}>
            <tr>
                <td style={tableCellStyle}>
                    <div style={{ height: height }}></div>
                </td>
            </tr>
        </table>
    );
};

export const GiantStepsWelcomeEmail = ({
}) => (
    <Html>
        <Head>
            <Font
                fontFamily="Arial"
                fallbackFontFamily="Helvetica"
                webFont={{
                    url: 'https://fonts.gstatic.com/s/arial/v1/arial.woff2',
                    format: 'woff2',
                }}
            />
        </Head>
        <Tailwind>
            <Preview>Welcome to GIANT STEPS! You&apos;re Ahead of the Game 👣</Preview>
            <Body style={main}>
                <Container style={{ maxWidth: '600px', backgroundColor: "#fff", width: '100%', margin: '0 auto' }}>

                    {/* <GapComponent height={20} /> */}

                    <SingleCenteredContent label="giant steps heading">
                        <>
                        <Img
                            src={'https://compantassets.s3.us-east-2.amazonaws.com/wbgNogapgiantsteps.png'}
                            alt="Giant Steps"
                            style={{
                                margin: 'auto',
                                width: "280px",
                                height: "150px",
                            }}
                        />

                            {/* <GapComponent height={15} /> */}
                            {/* <GapComponent height={15} /> */}

                        </>
                    </SingleCenteredContent>

                    <GapComponent height={20} />

                    <HeaderImgContent label="walking gif" width="100%" height="200px">
                        <Img
                            src={'https://compantassets.s3.us-east-2.amazonaws.com/walking.gif'}
                            alt="Giant Steps"
                            style={{
                                margin: 'auto',
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                        />
                    </HeaderImgContent>

                    {/* Message Card */}
                    <SingleCenteredContent label="We are literally..... ( main text content )">
                        <span style={{ padding: 0, margin: 0 }}>
                            <Text style={{ ...paragraphHeading, fontWeight: "bold", paddingLeft: 40, paddingRight: 40 }}>
                                We&apos;re literally about to move the world forward!
                            </Text>
                            <Text style={{ ...paragraphSubtext, paddingLeft: 60, paddingRight: 60 }}>
                                And salute to you for stepping up to the challenge.
                            </Text>
                            <Text style={{ ...paragraphSubtext, paddingLeft: 70, paddingRight: 70 }}>
                                We&apos;re lacing up our last little odds and ends before we launch, and you&apos;ll be one of the founding first to receive the exclusive link to the Lotus Always Growing app when we hit the ground running!
                            </Text>
                            <Text style={{ ...paragraphSubtext, paddingLeft: 70, paddingRight: 70 }}>
                                That means you&apos;ll be ahead of the pack, tracking your steps, unlocking challenges, and stacking up wins before anyone else.
                            </Text>
                            <Text style={{ ...paragraphSubtext, paddingLeft: 70, paddingRight: 70 }}>
                                So be on the lookout for our email for next steps soon!
                            </Text>
                            {/* <table style={tableStyle}>
                                <tr>
                                    <td style={tableCellStyle}>
                                        <span style={ctaButton}>
                                            Let&apos;s get it.
                                        </span>
                                    </td>
                                </tr>
                            </table> */}
                        </span>
                    </SingleCenteredContent>

                    {/* Footer */}
                    <SingleCenteredContent label="footer">
                        <Img
                            src={'https://compantassets.s3.us-east-2.amazonaws.com/signitureWhitbgGs.png'}
                            width={70}
                            height={30}
                            alt="Giant Steps"
                            style={{ margin: 'auto' }}
                        />
                        <GapComponent height={40}/>
                    </SingleCenteredContent>
                </Container>
            </Body>
        </Tailwind>
    </Html>
);

const main = {
    backgroundColor: "#fff",
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    padding: 0
};

const paragraphHeading = {
    color: "#000",
    fontSize: '16px',
    lineHeight: '20px',
    fontFamily: 'Arial, Helvetica, sans-serif'
};

const paragraphSubtext = {
    color: "#000",
    fontSize: '10px',
    lineHeight: '14px',
    fontFamily: 'Arial, Helvetica, sans-serif'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
};

const tableCellStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle',
};


export default GiantStepsWelcomeEmail;
