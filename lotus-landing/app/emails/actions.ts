'use server'

import GiantStepsWelcomeEmail from './giant-steps-welcome';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendConfirmedEmail(sentFromEmailBeforeAtSignString: string, subject: string, recipientEmail: string) {
  
  console.log("sending email")
  console.log("sentFromEmailBeforeAtSignString", sentFromEmailBeforeAtSignString)
  console.log("subject", subject)
  console.log("recipientEmail", recipientEmail)

    try {
    const { data, error } = await resend.emails.send({
      from: `Lotus <${sentFromEmailBeforeAtSignString}@thelotusapp.com>`,
    //   to: ['delivered@resend.dev'],
      to: [recipientEmail],
      subject: subject,
      react: GiantStepsWelcomeEmail({ email: recipientEmail }),
    });

    if (error) {
        return { 
            error: error.message, 
        };
    }

    console.log("success", data)

    return { 
        data: data,
        message: "success" 
    };


  } catch (error) {
    // Return error message if error is an Error object, otherwise return generic error
    return { 
        error: error instanceof Error ? error.message : 'An error occurred while sending email'
    };

  }
}
