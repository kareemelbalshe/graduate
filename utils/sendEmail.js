import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// Function to send an email using Nodemailer
export default async (userEmail, subject, htmlTemplate) => {
    try {
        // Create a transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD
            }
        })

        // Define email options including sender, recipient, subject, and HTML content
        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS,
            to: userEmail,
            subject: subject,
            html: htmlTemplate
        }

        // Send the email using the transporter and mail options
        const info = await transporter.sendMail(mailOptions)

        // Log the response after sending the email
        console.log("Email Send: " + info.response)
    } catch (error) {
        // If sending fails, log the error and throw an error
        console.log(error)
        throw new Error("Internal Server Error (nodemailer)")
    }
}

// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
