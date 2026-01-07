import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderData {
  orderNumber: string;
  personName: string;
  email: string;
  phone: string;
  location: string;
  items: string; // JSON string of items
  totalPrice: number;
  transactionId: string;
  paymentStatus: string;
}

/**
 * Format items for display in emails
 */
function formatItems(itemsString: string): string {
  try {
    const itemsArray: OrderItem[] = typeof itemsString === 'string' 
      ? JSON.parse(itemsString) 
      : itemsString;
    
    return itemsArray
      .map(item => `${item.quantity}   ${item.name}`)
      .join('\n');
  } catch (error) {
    console.error('Error formatting items:', error);
    return itemsString;
  }
}

/**
 * Generate items table HTML
 */
function generateItemsTable(formattedItems: string): string {
  return formattedItems
    .split("\n")
    .map(line => {
      const parts = line.split("   ");
      return `
        <tr>
          <td style="padding: 8px 12px; background-color: #ecf0f1;">${parts[0] || ""}</td>
          <td style="padding: 8px 12px; background-color: #ecf0f1;">${parts[1] || ""}</td>
        </tr>
      `;
    })
    .join("");
}

/**
 * Send confirmation email to customer
 */
export async function sendCustomerEmail(data: OrderData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return false;
  }

  const formattedItems = formatItems(data.items);
  const itemsTable = generateItemsTable(formattedItems);

  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; margin: 20px; padding: 20px; border-radius: 8px; }
    h2 { color: #9333ea; }
    .order-details { background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; }
    .order-details table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .order-details th, .order-details td { padding: 8px 12px; text-align: left; }
    .order-details th { background-color: #9333ea; color: white; }
    .order-details td { background-color: #ecf0f1; }
    .total-price { font-weight: bold; font-size: 18px; color: #9333ea; }
    .footer { font-size: 14px; color: #9333ea; }
  </style>
</head>
<body>
  <h2>Order Confirmation from CadetMart</h2>
  <p>Dear ${data.personName},</p>
  <p>Below are the details of your order:</p>

  <div class="order-details">
    <h3>Order Number: ${data.orderNumber}</h3>
    <table>
      <tr>
        <th>Quantity</th>
        <th>Item</th>
      </tr>
      ${itemsTable}
    </table>
  </div>

  <p class="total-price">Total Price: ₦${parseFloat(data.totalPrice.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  <p>Your payment has been confirmed and your items will be delivered soon</p>

  <div class="footer">
    <p>If you have any questions, feel free to contact us.</p>
    <p>THANK YOU!!<br>CadetMart Team</p>
  </div>
</body>
</html>
`;

  try {
    
    const result = await resend.emails.send({
      from: 'CadetMart <onboarding@resend.dev>',
      to: data.email,
      subject: 'Order Confirmation from CadetMart',
      html: htmlMessage,
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Error sending customer email:');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

/**
 * Send notification email to admin and staff
 */
export async function sendAdminNotification(data: OrderData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS || '';
  if (!adminEmails) {
    console.error('ADMIN_EMAILS not configured');
    return false;
  }

  const formattedItems = formatItems(data.items);
  const itemsTable = generateItemsTable(formattedItems);

  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; margin: 10px; padding: 10px; }
    h2 { color: #9333ea; }
    .order-details { background-color: #ffffff; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
    .order-details table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .order-details th, .order-details td { padding: 8px 12px; text-align: left; }
    .order-details th { background-color: #9333ea; color: white; }
    .order-details td { background-color: #ecf0f1; }
    .customer-info { margin-bottom: 20px; }
    .footer { font-size: 14px; color: #95a5a6; }
  </style>
</head>
<body>
  <h2>New Order Received - #${data.orderNumber}</h2>
  
  <div class="customer-info">
    <h3>Customer Information</h3>
    <p><strong>Name:</strong> ${data.personName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
    <p><strong>Location:</strong> ${data.location || "Not provided"}</p>
    <p><strong>Transaction ID:</strong> ${data.transactionId || "Not provided"}</p>
    <p><strong>Payment Status:</strong> ${data.paymentStatus || "Not provided"}</p>
  </div>
  
  <div class="order-details">
    <h3>Order Details</h3>
    <table>
      <tr>
        <th>Quantity</th>
        <th>Item</th>
      </tr>
      ${itemsTable}
    </table>
    <p><strong>Total Price:</strong> ₦${parseFloat(data.totalPrice.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
  
  <div class="footer">
    <p>PLEASE CAREFULLY CONFIRM AND VERIFY PAYMENT RECEIPTS</p>
  </div>
</body>
</html>
`;

  try {
    const result = await resend.emails.send({
      from: 'CadetMart <onboarding@resend.dev>',
      to: adminEmails.split(',').map(e => e.trim()),
      subject: `New Order Notification - ${data.orderNumber}`,
      html: htmlMessage,
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
    return false;
  }
}
