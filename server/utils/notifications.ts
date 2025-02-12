import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is required');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendConfirmationEmail(email: string, bookingDetails: any) {
  try {
    const msg = {
      to: email,
      from: 'noreply@autotransport.com', // Replace with your verified sender
      templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your template ID
      dynamicTemplateData: {
        name: bookingDetails.name,
        vehicle: `${bookingDetails.year} ${bookingDetails.make} ${bookingDetails.model}`,
        pickup: bookingDetails.pickupLocation,
        delivery: bookingDetails.dropoffLocation,
        shipDate: new Date(bookingDetails.shipmentDate).toLocaleDateString(),
        transportType: bookingDetails.selectedTransport === 'enclosed' ? 'Enclosed Transport' : 'Open Transport',
      },
    };
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendConfirmationSMS(phone: string, bookingDetails: any) {
  // Implement RingCentral SMS here once credentials are provided
  return true;
}
