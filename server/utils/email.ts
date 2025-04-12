import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('⚠️ SENDGRID_API_KEY environment variable is not set!');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
}

/**
 * Email templates for different marketing messages
 */
export const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to Amerigo Auto Transport!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Amerigo Auto Transport!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>Thank you for your interest in Amerigo Auto Transport. We're excited to help you with your vehicle shipping needs!</p>
            <p>We've received your request to transport your ${data.year || ''} ${data.make || ''} ${data.model || 'vehicle'} from ${data.pickupLocation || '[Origin]'} to ${data.dropoffLocation || '[Destination]'}.</p>
            <p>Our team of auto transport experts is reviewing your request and will be in touch shortly. In the meantime, here's what you can expect:</p>
            <ul>
              <li>Personalized service from start to finish</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Full insurance coverage during transport</li>
              <li>Real-time updates on your vehicle's journey</li>
            </ul>
            <p>If you have any questions or need to update your information, please don't hesitate to contact us.</p>
            <a href="https://amerigo-transport.com/track" class="button">Track Your Shipment</a>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | contact@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} because you requested information from Amerigo Auto Transport.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  QUOTE_CONFIRMATION: {
    subject: 'Your Auto Transport Quote from Amerigo',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .quote-box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; background-color: white; }
          .price { font-size: 24px; font-weight: bold; color: #e63946; }
          .button { background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Auto Transport Quote</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>Thank you for requesting a quote from Amerigo Auto Transport. We're pleased to provide you with the following estimate for shipping your vehicle:</p>
            
            <div class="quote-box">
              <h3>Quote Details:</h3>
              <p><strong>Vehicle:</strong> ${data.year || ''} ${data.make || ''} ${data.model || 'Vehicle'}</p>
              <p><strong>From:</strong> ${data.pickupLocation || '[Origin]'}</p>
              <p><strong>To:</strong> ${data.dropoffLocation || '[Destination]'}</p>
              <p><strong>Distance:</strong> ${data.distance || '0'} miles</p>
              <p><strong>Estimated Transit Time:</strong> ${data.transitTime || '0'} days</p>
              <p><strong>Open Transport Price:</strong> <span class="price">$${data.openTransportPrice || '0'}</span></p>
              <p><strong>Enclosed Transport Price:</strong> <span class="price">$${data.enclosedTransportPrice || '0'}</span></p>
            </div>
            
            <p>This quote is valid for 14 days from today. To secure this rate and schedule your shipment, please click the button below:</p>
            <a href="https://amerigo-transport.com/book?quote_id=${data.quoteId || '123456'}" class="button">Book Your Shipment Now</a>
            
            <p>If you have any questions or need to modify your shipment details, please contact our customer service team at 1-800-123-4567.</p>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | quotes@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} because you requested a quote from Amerigo Auto Transport.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  BOOKING_CONFIRMATION: {
    subject: 'Your Auto Transport Booking Confirmation',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .booking-box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; background-color: white; }
          .confirmation-number { font-size: 20px; font-weight: bold; color: #1a4b8c; background-color: #f0f0f0; padding: 10px; text-align: center; }
          .button { background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>Great news! Your vehicle transport booking has been confirmed with Amerigo Auto Transport.</p>
            
            <div class="booking-box">
              <p class="confirmation-number">Confirmation #: ${data.bookingId || 'AMT' + Date.now().toString().substring(6)}</p>
              <h3>Booking Details:</h3>
              <p><strong>Vehicle:</strong> ${data.year || ''} ${data.make || ''} ${data.model || 'Vehicle'}</p>
              <p><strong>Pickup Location:</strong> ${data.pickupLocation || '[Origin]'}</p>
              <p><strong>Pickup Date:</strong> ${data.pickupDate || 'To be scheduled'}</p>
              <p><strong>Delivery Location:</strong> ${data.dropoffLocation || '[Destination]'}</p>
              <p><strong>Estimated Delivery Date:</strong> ${data.deliveryDate || 'To be determined'}</p>
              <p><strong>Service Type:</strong> ${data.transportType === 'enclosed' ? 'Enclosed Transport' : 'Open Transport'}</p>
              <p><strong>Total Price:</strong> $${data.selectedPrice || data.openTransportPrice || '0'}</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Our dispatch team will contact you within 24-48 hours to coordinate the exact pickup time and location.</li>
              <li>Please ensure your vehicle is clean, with no more than 1/4 tank of gas.</li>
              <li>Remove all personal belongings from the vehicle before transport.</li>
              <li>Have your payment method ready for the driver. (No payment is required until the vehicle is dispatched)</li>
            </ol>
            
            <p>Track your shipment or make changes to your booking by clicking the button below:</p>
            <a href="https://amerigo-transport.com/track?booking=${data.bookingId || 'AMT123'}" class="button">Manage Your Booking</a>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | bookings@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} regarding your recent booking with Amerigo Auto Transport.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  PICKUP_NOTIFICATION: {
    subject: 'Your Vehicle Has Been Picked Up',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; background-color: white; }
          .status { font-size: 18px; font-weight: bold; color: #28a745; text-align: center; padding: 10px; background-color: #e8f5e9; }
          .button { background-color: #1a4b8c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vehicle Pickup Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>We're pleased to inform you that your vehicle has been successfully picked up and is now in transit!</p>
            
            <div class="status-box">
              <p class="status">✓ VEHICLE PICKED UP</p>
              <h3>Shipment Details:</h3>
              <p><strong>Vehicle:</strong> ${data.year || ''} ${data.make || ''} ${data.model || 'Vehicle'}</p>
              <p><strong>Carrier:</strong> ${data.carrierName || 'Amerigo Transport'}</p>
              <p><strong>Driver Name:</strong> ${data.driverName || 'John'}</p>
              <p><strong>Driver Phone:</strong> ${data.driverPhone || '555-123-4567'}</p>
              <p><strong>Pickup Location:</strong> ${data.pickupLocation || '[Origin]'}</p>
              <p><strong>Pickup Date/Time:</strong> ${data.actualPickupDate || new Date().toLocaleDateString()}</p>
              <p><strong>Estimated Delivery:</strong> ${data.estimatedDeliveryDate || 'In approximately ' + (data.transitTime || '3-5') + ' days'}</p>
            </div>
            
            <p>Your vehicle is now on its way to ${data.dropoffLocation || 'its destination'}. Our team will keep you updated on its progress.</p>
            
            <p>Track your shipment in real-time by clicking the button below:</p>
            <a href="https://amerigo-transport.com/track?booking=${data.bookingId || 'AMT123'}" class="button">Track Your Vehicle</a>
            
            <p>If you have any questions or concerns during transit, please contact our customer service team at 1-800-123-4567.</p>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | tracking@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} regarding your vehicle shipment with Amerigo Auto Transport.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  DELIVERY_NOTIFICATION: {
    subject: 'Your Vehicle Has Been Delivered!',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-box { border: 1px solid #ddd; padding: 15px; margin-top: 20px; background-color: white; }
          .status { font-size: 18px; font-weight: bold; color: #28a745; text-align: center; padding: 10px; background-color: #e8f5e9; }
          .button { background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .review-request { background-color: #fff3cd; padding: 15px; margin-top: 20px; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vehicle Delivery Confirmation</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>Great news! Your vehicle has been successfully delivered to its destination.</p>
            
            <div class="status-box">
              <p class="status">✓ VEHICLE DELIVERED</p>
              <h3>Delivery Details:</h3>
              <p><strong>Vehicle:</strong> ${data.year || ''} ${data.make || ''} ${data.model || 'Vehicle'}</p>
              <p><strong>Delivery Location:</strong> ${data.dropoffLocation || '[Destination]'}</p>
              <p><strong>Delivery Date/Time:</strong> ${data.actualDeliveryDate || new Date().toLocaleDateString()}</p>
              <p><strong>Received By:</strong> ${data.receiverName || 'You or your designated recipient'}</p>
            </div>
            
            <p>Thank you for choosing Amerigo Auto Transport for your vehicle shipping needs. We hope your experience was excellent from start to finish.</p>
            
            <div class="review-request">
              <h3>How did we do?</h3>
              <p>We'd love to hear about your experience. Please take a moment to share your feedback:</p>
              <a href="https://amerigo-transport.com/review?booking=${data.bookingId || 'AMT123'}" class="button">Leave a Review</a>
            </div>
            
            <p>If you have any questions about your completed shipment or need assistance with anything else, please don't hesitate to contact our customer service team at 1-800-123-4567.</p>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | support@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} regarding your completed vehicle shipment with Amerigo Auto Transport.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  FOLLOW_UP: {
    subject: 'Need Help with Your Auto Transport?',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a4b8c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          .benefits { background-color: #f0f4f8; padding: 15px; margin-top: 20px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We're Here to Help with Your Auto Transport</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name || 'there'},</p>
            <p>We noticed you recently requested a quote from Amerigo Auto Transport but haven't completed your booking. We understand that shipping a vehicle is an important decision, and we're here to help answer any questions you might have.</p>
            
            <p>Your quote for shipping your ${data.year || ''} ${data.make || ''} ${data.model || 'vehicle'} from ${data.pickupLocation || '[Origin]'} to ${data.dropoffLocation || '[Destination]'} is still valid, and we'd be happy to help you complete your booking.</p>
            
            <div class="benefits">
              <h3>Why Choose Amerigo Auto Transport?</h3>
              <ul>
                <li><strong>Experienced Carriers:</strong> Our network includes only fully insured, experienced auto transporters</li>
                <li><strong>Door-to-Door Service:</strong> Convenient pickup and delivery as close to your locations as legally possible</li>
                <li><strong>Full Insurance Coverage:</strong> Your vehicle is fully insured during the entire transport process</li>
                <li><strong>No Upfront Payment:</strong> You don't pay until your vehicle is assigned to a carrier</li>
                <li><strong>Real-Time Updates:</strong> Track your vehicle's journey from pickup to delivery</li>
              </ul>
            </div>
            
            <p>Would you like us to provide a fresh quote or answer any specific questions about our services? Simply reply to this email or call us at 1-800-123-4567.</p>
            
            <p>Ready to book now? Click the button below:</p>
            <a href="https://amerigo-transport.com/book?quote_id=${data.quoteId || '123456'}" class="button">Complete Your Booking</a>
          </div>
          <div class="footer">
            <p>Amerigo Auto Transport | 1-800-123-4567 | support@amerigo-transport.com</p>
            <p>123 Transport Lane, Shipping City, SC 12345</p>
            <p><small>This email was sent to ${data.email || 'you'} because you requested information from Amerigo Auto Transport. If you no longer wish to receive these emails, <a href="https://amerigo-transport.com/unsubscribe?email=${data.email || 'email@example.com'}">unsubscribe here</a>.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

/**
 * Send an email using SendGrid
 */
export async function sendEmail(options: {
  to: string;
  from?: string;
  templateName: keyof typeof EMAIL_TEMPLATES;
  templateData: any;
  cc?: string[];
  bcc?: string[];
}): Promise<{ success: boolean; message: string }> {
  try {
    const { to, templateName, templateData, cc, bcc } = options;
    
    // Default sender email
    const from = options.from || 'noreply@amerigo-transport.com';
    
    // Get the template
    const template = EMAIL_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }
    
    // Generate the email content
    const msg = {
      to,
      from,
      subject: template.subject,
      html: template.html(templateData),
      cc,
      bcc
    };
    
    // Log email sending attempt
    console.log(`📧 SENDING EMAIL: "${template.subject}" to ${to}`);
    
    // Send the email
    await sgMail.send(msg);
    
    console.log(`✅ EMAIL SENT SUCCESSFULLY to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ EMAIL SENDING FAILED:', error);
    return { 
      success: false, 
      message: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}