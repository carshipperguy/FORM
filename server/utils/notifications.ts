import sgMail from '@sendgrid/mail';
import { SDK } from '@ringcentral/sdk';

// Check SendGrid API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize RingCentral SDK if credentials are available
let ringcentralPlatform: any = null;
const rcCredentials = {
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
  serverUrl: process.env.RINGCENTRAL_SERVER_URL,
  username: process.env.RINGCENTRAL_USERNAME,
  extension: process.env.RINGCENTRAL_EXTENSION,
  password: process.env.RINGCENTRAL_PASSWORD
};

const initRingCentral = async () => {
  if (!ringcentralPlatform && rcCredentials.clientId && rcCredentials.clientSecret) {
    try {
      ringcentralPlatform = new SDK({
        server: rcCredentials.serverUrl || 'https://platform.ringcentral.com',
        clientId: rcCredentials.clientId,
        clientSecret: rcCredentials.clientSecret
      });
      
      await ringcentralPlatform.login({
        username: rcCredentials.username,
        extension: rcCredentials.extension || '101',
        password: rcCredentials.password
      });
      
      console.log('RingCentral initialized successfully');
    } catch (error) {
      console.error('Error initializing RingCentral:', error);
      ringcentralPlatform = null;
    }
  }
  return ringcentralPlatform;
};

export async function sendConfirmationEmail(email: string, bookingDetails: any) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY not found, email notification skipped');
    return false;
  }
  
  try {
    // Format the price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(bookingDetails.finalPrice || 0);
    
    // Format the date
    const formattedDate = new Date(bookingDetails.shipmentDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Create a dynamic HTML email with a booking button
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png" alt="Amerigo Auto Transport" style="max-width: 200px; height: auto;">
          <h1 style="color: #1e3a8a; margin-top: 10px;">Your Auto Transport Quote</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; font-size: 20px; margin-top: 0;">Hello ${bookingDetails.name || 'Customer'},</h2>
          <p>Thank you for choosing Amerigo Auto Transport. Here are your quote details:</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Vehicle:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.year} ${bookingDetails.make} ${bookingDetails.model}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Pickup:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.pickupLocation}${bookingDetails.pickupZip ? ` (ZIP: ${bookingDetails.pickupZip})` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Dropoff:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.dropoffLocation}${bookingDetails.dropoffZip ? ` (ZIP: ${bookingDetails.dropoffZip})` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Ship Date:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Transport Type:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${bookingDetails.selectedTransport === 'enclosed' ? 'Enclosed Transport' : 'Open Transport'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Price:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-size: 20px; color: #dc2626; font-weight: bold;">${formattedPrice}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Due Now:</td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">$0.00</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="display: inline-block; background-color: #1e3a8a; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">Complete Your Booking</a>
        </div>
        
        <div style="font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p>This quote is valid for 7 days. If you have any questions, please contact our team.</p>
          <p>Amerigo Auto Transport • Military Owned • Family Operated • Proudly American</p>
        </div>
      </div>
    `;
    
    const msg = {
      to: email,
      from: 'quotes@amerigotransport.com', // Replace with your verified sender
      subject: 'Your Auto Transport Quote is Ready',
      text: `Your quote for transporting your ${bookingDetails.year} ${bookingDetails.make} ${bookingDetails.model} from ${bookingDetails.pickupLocation} to ${bookingDetails.dropoffLocation} is ${formattedPrice}. No payment required until pickup.`,
      html: htmlContent,
    };
    
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendConfirmationSMS(phone: string, bookingDetails: any) {
  try {
    // Initialize RingCentral if needed
    const platform = await initRingCentral();
    if (!platform) {
      console.warn('RingCentral platform not initialized, SMS notification skipped');
      return false;
    }
    
    // Format the price
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(bookingDetails.finalPrice || 0);
    
    // Create SMS message text
    const messageText = `
      AMERIGO AUTO TRANSPORT: Your quote is ready!
      
      Vehicle: ${bookingDetails.year} ${bookingDetails.make} ${bookingDetails.model}
      From: ${bookingDetails.pickupLocation}${bookingDetails.pickupZip ? ` (${bookingDetails.pickupZip})` : ''}
      To: ${bookingDetails.dropoffLocation}${bookingDetails.dropoffZip ? ` (${bookingDetails.dropoffZip})` : ''}
      Price: ${formattedPrice}
      
      $0 due now. To complete your booking, visit: https://amerigotransport.com/book
      
      Questions? Reply to this text or call (800) 555-1234
    `;
    
    // Send SMS through RingCentral
    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', {
      from: { phoneNumber: process.env.RINGCENTRAL_USERNAME },
      to: [{ phoneNumber: phone }],
      text: messageText.trim()
    });
    
    console.log(`Confirmation SMS sent to ${phone}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}
