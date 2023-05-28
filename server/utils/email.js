const nodemailer=require('nodemailer');
const sendMail=async(options)=>{
    const transporter=nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "bb977a7b094698",
            pass: "f82558e63920a9"
        }
    });
    const mailOptions={
        from:'Rishabh Jain <hello@rish.com>',
        to:options.email,
        subject:options.subject,
        text:options.message,
    }
    await transporter.sendMail(mailOptions);
}
module.exports=sendMail;