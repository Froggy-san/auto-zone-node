import { IUser } from "../models/userModel";
import nodemailer from "nodemailer";
export class Email {
  public to;
  public firstName;
  public url;
  public from;

  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.username.split(" ")[0];
    this.url = url;
    this.from = `Auto Zone <${process.env.EMAIL_FROM}>`;
  }

  createNewTrasport() {
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "PRODUCTION") {
    } else {
      return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 587,
        auth: {
          user: process.env.MAIL_TRAP_USERNAME,
          pass: process.env.MAIL_TRAP_PASSWORD,
        },
        debug: true,
        logger: true,
      });
    }
  }

  async send(templete: string, subject: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: templete,
      text: templete.replace(/<[^>]*>?/gm, ""),
    };

    await this.createNewTrasport()?.sendMail(mailOptions);
  }

  async sendPasswordResetToken() {
    const html = `
  <div style="font-family: sans-serif; line-height: 1.5;">
    <h1>Hi ${this.firstName},</h1>
    <p>Forgot your password? Click the button below to reset it:</p>
    <a href="${this.url}" style="background: #222; color: #fff; padding: 10px 20px;">Reset Password</a>
    <p>If you didn't forget your password, please ignore this email!</p>
  </div>
`;
    await this.send(html, "Your password reset token (vaild for 10 mins)");
  }
}
