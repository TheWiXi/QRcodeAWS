const qr = require('qrcode');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

class QRCode {
  constructor(url) {
    this.url = url;
    this.createdAt = new Date();
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
  }

  async generate() {
    try {
      const buffer = await qr.toBuffer(this.url);
      this.buffer = buffer;
      return buffer;
    } catch (error) {
      throw new Error(`Error generating QR code: ${error.message}`);
    }
  }

  async save() {
    try {
      if (!this.buffer) {
        await this.generate();
      }
      
      const key = `qr-${this.createdAt.getTime()}.png`;
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: this.buffer,
        ContentType: 'image/png'
      });

      await this.s3Client.send(command);

      // Construir la URL de S3 manualmente
      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        url: this.url,
        s3Url: s3Url,
        base64: this.buffer.toString('base64'),
        createdAt: this.createdAt
      };
    } catch (error) {
      throw new Error(`Error saving QR code: ${error.message}`);
    }
  }
}

module.exports = QRCode;