import AWS from 'aws-sdk';
import 'dotenv/config';


const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION
}
console.log("ses config: ",SES_CONFIG)
const AWS_SES = new AWS.SES(SES_CONFIG)

const sendEmail = async (recipientEmail, name) => {
    let params = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
            ToAddresses: [recipientEmail]
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<html>
                    <head>
                        <style>
                            .container {
                                padding: 10px;
                                margin: 10px;
                                border: 1px solid #333;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Hello ${name},</h1>
                            <p>Thank you for signing up with us. We are excited to have you on board.</p>
                            <p>Best Regards,</p>
                            <p>Team Awesome</p>
                        </div>
                    </body>
                    </html>`
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `Hello ${name},\n\nThank you for signing up with us. We are excited to have you on board.\n\nBest Regards,\nTeam Awesome`
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Welcome to our platform"
            }
        }
        }
    try{
        const response = await AWS_SES.sendEmail(params).promise()
        console.log("email sent: ",response) 
    }
    catch(error)
    {
        console.log("error: ",error)
    }

}

sendEmail("hersh.singhh@gmail.com", "Harsh")