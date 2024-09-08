import nodemailer from 'nodemailer'
import 'dotenv/config'

const fs = require('fs');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

export const sendWelcomeEmail = async (receiver) => {
    const htmlContent = fs.readFileSync('email_template.html', 'utf8');
    const mailOptions = {
      from: {
        name: 'POTENTIA.',
        address: process.env.EMAIL,
      },
      to: receiver, // list of receivers
      subject: 'Welcome To The POTENTIA. Community', // Subject line
      text: 'Hello world?', // plain text body
      html: htmlContent
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
};

export const sendForgotPasswordEmail = async (receiver) => {
    const htmlContent = fs.readFileSync('email_template.html', 'utf8');
    const mailOptions = {
      from: {
        name: 'POTENTIA.',
        address: process.env.EMAIL,
      },
      to: receiver, // list of receivers
      subject: 'Welcome To The POTENTIA. Community', // Subject line
      text: 'Hello world?', 
      html: htmlContent
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
};