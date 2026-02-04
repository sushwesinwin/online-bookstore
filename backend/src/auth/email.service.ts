import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderNumber: string,
    orderDetails: any,
  ): Promise<void> {
    // Format order items for display
    const itemsHtml = orderDetails.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.book.title}</strong><br/>
            <small>by ${item.book.author}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${Number(item.price).toFixed(2)}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${(Number(item.price) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `,
      )
      .join('');

    const totalAmount = Number(orderDetails.totalAmount).toFixed(2);
    const orderDate = new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0 0 10px 0;">Order Confirmation</h1>
            <p style="margin: 0; color: #7f8c8d;">Thank you for your order!</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
            <table style="width: 100%; margin-bottom: 15px;">
              <tr>
                <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Order Date:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${orderDate}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Status:</strong></td>
                <td style="padding: 5px 0; text-align: right;">
                  <span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px;">
                    ${orderDetails.status}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 15px 10px 10px 10px; text-align: right; border-top: 2px solid #dee2e6;">
                    <strong>Total Amount:</strong>
                  </td>
                  <td style="padding: 15px 10px 10px 10px; text-align: right; border-top: 2px solid #dee2e6;">
                    <strong style="font-size: 18px; color: #28a745;">$${totalAmount}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">What's Next?</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your order is being processed and will be shipped soon</li>
              <li>You'll receive a shipping confirmation email with tracking information</li>
              <li>You can track your order status in your account dashboard</li>
            </ul>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-top: 0;">Shipping Information</h3>
            <p style="margin: 5px 0;">
              <strong>${orderDetails.user.firstName} ${orderDetails.user.lastName}</strong><br/>
              ${orderDetails.user.email}
            </p>
            <p style="margin: 15px 0 5px 0; color: #7f8c8d; font-size: 14px;">
              <strong>Tracking Number:</strong> Will be provided once your order ships
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #7f8c8d; font-size: 14px;">
            <p>Need help? Contact our support team at ${this.configService.get<string>('EMAIL_USER')}</p>
            <p style="margin: 10px 0;">Thank you for shopping with us!</p>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
