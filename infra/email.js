import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
})

async function send() {

}

const email = {
    send
}

export default email