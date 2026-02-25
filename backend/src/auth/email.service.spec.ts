import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockTransporter: any;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        EMAIL_HOST: 'smtp.example.com',
        EMAIL_PORT: 587,
        EMAIL_USER: 'test@example.com',
        EMAIL_PASS: 'password',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create transporter with correct configuration', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password',
        },
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct parameters', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-reset-token';

      await service.sendPasswordResetEmail(email, resetToken);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.stringContaining('BookStore'),
        to: email,
        subject: expect.stringContaining('Reset Your Password'),
        html: expect.stringContaining('Password Reset Request'),
      });

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(resetToken);
      expect(callArgs.html).toContain(
        'http://localhost:3000/reset-password?token=',
      );
    });

    it('should include reset URL in email', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-reset-token';

      await service.sendPasswordResetEmail(email, resetToken);

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(
        `http://localhost:3000/reset-password?token=${resetToken}`,
      );
    });

    it('should throw error if email sending fails', async () => {
      const email = 'user@example.com';
      const resetToken = 'test-reset-token';
      const error = new Error('Email sending failed');

      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendPasswordResetEmail(email, resetToken),
      ).rejects.toThrow(error);
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email with correct parameters', async () => {
      const email = 'user@example.com';
      const orderNumber = 'ORD-12345';
      const orderDetails = {
        items: [
          {
            book: { title: 'Book 1', author: 'Author 1' },
            quantity: 2,
            price: 20,
          },
        ],
        totalAmount: 40,
        createdAt: new Date(),
        status: 'CONFIRMED',
        user: { firstName: 'John', lastName: 'Doe', email: 'user@example.com' },
      };

      await service.sendOrderConfirmationEmail(
        email,
        orderNumber,
        orderDetails,
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: expect.stringContaining('BookStore'),
        to: email,
        subject: expect.stringContaining(`Order Confirmation - ${orderNumber}`),
        html: expect.stringContaining('Order Confirmation'),
      });

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(orderNumber);
      expect(callArgs.html).toContain('Book 1');
    });

    it('should include order details in email', async () => {
      const email = 'user@example.com';
      const orderNumber = 'ORD-12345';
      const orderDetails = {
        items: [
          {
            book: { title: 'Book 1', author: 'Author 1' },
            quantity: 1,
            price: 15,
          },
        ],
        totalAmount: 15,
        createdAt: new Date(),
        status: 'CONFIRMED',
        user: { firstName: 'John', lastName: 'Doe', email: 'user@example.com' },
      };

      await service.sendOrderConfirmationEmail(
        email,
        orderNumber,
        orderDetails,
      );

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Book 1');
    });

    it('should throw error if email sending fails', async () => {
      const email = 'user@example.com';
      const orderNumber = 'ORD-12345';
      const orderDetails = {
        items: [],
        totalAmount: 0,
        createdAt: new Date(),
        user: { firstName: 'John', lastName: 'Doe' },
      };
      const error = new Error('Email sending failed');

      mockTransporter.sendMail.mockRejectedValue(error);

      await expect(
        service.sendOrderConfirmationEmail(email, orderNumber, orderDetails),
      ).rejects.toThrow(error);
    });
  });
});
