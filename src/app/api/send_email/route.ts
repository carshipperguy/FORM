import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { markQuoteCompleted } from "../../lib/partialLeadService";

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

const mailOptions = {
  from: email,
  to: [
    "zach@amerigoautotransport.com",
    "tanveerctg2014@gmail.com",
    "tanveerctg2018@gmail.com",
    "tanveerctg@instawebworks.com.au",
    "Newquotes@amerigoautotransport.com",
    "carshipperguy@gmail.com",
  ],
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
});

export async function POST(request: Request) {
  const res = await request.json();

  try {
    await transporter.sendMail({
      ...mailOptions,
      // cc: [
      //   "zach@amerigoautotransport.com",
      //   "tanveerctg2014@gmail.com",
      //   "tanveerctg2018@gmail.com",
      //   "nayeemcmc@gmail.com",
      //   "tanveerctg@instawebworks.com.au",
      //   "Newquotes@amerigoautotransport.com",
      //   "outlook_5A2E704EE276DB9A@outlook.com",
      // ],
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="content-type" content="text/html; charset=utf-8" />
          <title>*|MC:SUBJECT|*</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Poppins:400,500,600,700"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,500,700"
            rel="stylesheet"
          />
      
          <style type="text/css">
            .preheader {
              display: none !important;
            }
            @media only screen and (max-width: 580px) {
              .m_device_width100P {
                width: 100% !important;
                min-width: 100% !important;
                height: auto !important;
                border-right: 0 !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_db {
                display: block !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_display_n {
                height: 20px !important;
                display: block;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_img_mc_fix {
                display: block !important;
                text-align: center !important;
                width: 100% !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_ptb0lr25 {
                padding: 0 25px !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_ptb0lr10 {
                padding: 0 10px !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_outer_padding_tb0lr10 {
                padding: 0 5px !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_db_spacing {
                height: 30px !important;
                display: block;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_tlrp {
                padding: 10px 10px 0 !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_p_lr15 {
                padding: 0 15px !important;
              }
            }
            @media only screen and (max-width: 580px) {
              .m_p_lr15 {
                padding: 0 15px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              m-ptb0-lr10 {
                padding: 0 10px !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .display-in-block {
                display: block !important;
                text-align: center !important;
                padding: 5px 0 !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .m-p-l-0 {
                padding-left: 0 !important;
              }
            }
            @media only screen and (max-width: 480px) {
              .m-ptb15-lr10 {
                padding: 15px 30px !important;
              }
            }
          </style>
        </head>
        <body
          style="
            margin: 0px;
            padding: 0px;
            background: #ffffff;
            background-size: cover;
            width: 100%;
          "
        >
          <div
            style="
              margin: 0px;
              padding: 0px;
              background: #ffffff;
              background-size: cover;
              width: 100%;
            "
          >
            <table
              width="100%"
              border="0"
              cellspacing="0"
              cellpadding="0"
              style="background: #ffffff; background-size: cover; width: 100%"
            >
              <tbody>
                <tr>
                  <td align="center" class="m_outer_padding_tb0lr10">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" class="m_outer_p_tb0_lr5">
                          <table
                            width="660"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            class="m_device_width100P"
                          >
                            <tr>
                              <td align="left" style="padding: 0px 0px 0px 0px">
                                <table
                                  class="mobile-width"
                                  width="100%"
                                  border="0"
                                  cellspacing="0"
                                  cellpadding="0"
                                >
                                  <tbody>
                                    <tr>
                                      <td height="10">
                                        <img
                                          src="https://gallery.mailchimp.com/d942a4805f7cb9a8a6067c1e6/images/1a808f19-c541-48d8-afad-3d9529131c98.gif"
                                          alt=""
                                          width="1"
                                          style="width: 1px; display: block"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td class="mobile-width" align="center">
                                        <a
                                          href="https://amerigoautotransport.com/"
                                          target="_blank"
                                        >
                                          <img
                                            src="https://amerigoautotransport.com/wp-content/uploads/2023/08/Amerigo1-1-1024x464.png"
                                            alt="Amerigo Auto Transport"
                                            border="0"
                                            style="width: 130px; max-width: 130px"
                                        /></a>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td height="10">
                                        <img
                                          src="https://gallery.mailchimp.com/d942a4805f7cb9a8a6067c1e6/images/1a808f19-c541-48d8-afad-3d9529131c98.gif"
                                          alt=""
                                          width="1"
                                          style="width: 1px; display: block"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
      
                <tr>
                  <td align="center" class="m_outer_padding_tb0lr10">
                    <table
                      class="m_device_width100P"
                      align="center"
                      width="660"
                      border="0"
                      cellspacing="0"
                      cellpadding="0"
                      style="background: #f7f7f7"
                    >
                      <tbody>
                        <!-- Article Section Start -->
                        <tr>
                          <td class="mob_ptb0lr10">
                            <table
                              width="100%"
                              border="0"
                              cellspacing="0"
                              cellpadding="0"
                            >
                              <tbody>
                                <tr>
                                  <th
                                    valign="top"
                                    class="m_db"
                                    style="padding: 10px 20px 10px 20px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="m_device_width100P"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 22px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: 600;
                                              text-decoration: underline;
                                            "
                                          >
                                            Origin & Destination
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                            <span style="font-weight:500;">Ship From:</span> ${
                                              res.data.origin_destination
                                                .transport_car_from.label
                                            }
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 5px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;"> Ship To:</span> ${
                                            res.data.origin_destination
                                              .transport_car_to.label
                                          }
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </th>
                                </tr>
                                <tr>
                                  <th
                                    valign="top"
                                    class="m_db"
                                    style="padding: 10px 20px 10px 20px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="m_device_width100P"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 22px;
                                              padding: 5px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: 600;
                                              text-decoration: underline;
                                            "
                                          >
                                            Vehicle Details
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;">Vehicle Type:</span> ${
                                            res.data.vehicle_details
                                              .vehicle_type.name
                                          }
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;">Year:</span> ${
                                            res.data.vehicle_details.year
                                              .name ||
                                            res.data.vehicle_details.year
                                          }
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;"> Make:</span>  ${
                                            res.data.vehicle_details.company
                                              .make ||
                                            res.data.vehicle_details.company
                                          }
                                          </td>
                                        </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;"> Model:</span> ${
                                            res.data.vehicle_details
                                              .vehicle_name.model ||
                                            res.data.vehicle_details
                                              .vehicle_name
                                          }
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </th>
                                </tr>
                                <tr>
                                  <th
                                    valign="top"
                                    class="m_db"
                                    style="padding: 10px 20px 10px 20px"
                                  >
                                    <table
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="m_device_width100P"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 22px;
                                              padding: 5px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: 600;
                                              text-decoration: underline;
                                            "
                                          >
                                            Shipment Details
                                          </td>
                                        </tr>
                                        <tr>
                                        <td
                                          align="left"
                                          style="
                                            display: block;
                                            font-size: 18px;
                                            padding: 2px 0px;
                                            font-family: 'Open Sans', Arial,
                                              sans-serif;
                                            line-height: 30px;
                                            font-weight: normal;
                                          "
                                        >
                                        <span style="font-weight:500;">Name:</span> ${
                                          res.data.shipment_details.name
                                        }
                                        </td>
                                      </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;">Date:</span> ${
                                            res.data.shipment_details
                                              .preferred_date
                                          }
                                          </td>
                                        </tr>
                                 
                                        <tr>
                                        <td
                                          align="left"
                                          style="
                                            display: block;
                                            font-size: 18px;
                                            padding: 2px 0px;
                                            font-family: 'Open Sans', Arial,
                                              sans-serif;
                                            line-height: 30px;
                                            font-weight: normal;
                                          "
                                        >
                                        <span style="font-weight:500;">Email:</span> ${
                                          res.data.shipment_details.email
                                        }
                                        </td>
                                      </tr>
                                        <tr>
                                          <td
                                            align="left"
                                            style="
                                              display: block;
                                              font-size: 18px;
                                              padding: 2px 0px;
                                              font-family: 'Open Sans', Arial,
                                                sans-serif;
                                              line-height: 30px;
                                              font-weight: normal;
                                            "
                                          >
                                          <span style="font-weight:500;"> Phone:</span> ${
                                            res.data.shipment_details.phone
                                          }
                                          </td>
                                        </tr>
                                  
                                      </tbody>
                                    </table>
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <!-- Article Section End -->
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!---------- 01. BLOCK END ---------->
                <!-- Footer Start here -->
                <tr>
                  <td align="center" style="background: #ffffff">
                    <table
                      width="100%"
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                    >
                      <tr>
                        <td align="center">
                          <table
                            width="100%"
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                          >
                            <tr>
                              <td height="20"></td>
                            </tr>
                            <tr>
                              <td align="center">
                                <a
                                  href="https://www.janets.org.uk/"
                                  target="_blank"
                                  style="text-decoration: none; color: #333333"
                                >
                                  <img
                                    border="0"
                                    src="https://gallery.mailchimp.com/03bd2149b9fe7f0843b1077ac/images/3dd49076-a87e-4fb2-8a6d-efc78672a924.png"
                                    alt=""
                                    style="display: inline-block; margin: auto"
                                /></a>
                              </td>
                            </tr>
                          
                            <tr>
                              <td
                                style="
                                  padding: 0px 10px 0px 10px;
                                  font-family: Roboto, sans-serif;
                                  font-weight: 500;
                                  font-size: 12px;
                                  line-height: 1.5;
                                  color: #333333;
                                  text-align: center;
                                "
                              >
                                 300 SE 2ND ST #600A FORT LAUDERDALE, FL 33301 <br /> 
                                <a
                                  href="mailto:zach@amerigoautotransport.com"
                                  style="text-decoration: none; color: #333333"
                                  >zach@amerigoautotransport.com</a
                                >
                               /
                                <a
                                href="mailto:fred@amerigoautotransport.com"
                                style="text-decoration: none; color: #333333"
                                >fred@amerigoautotransport.com</a
                               >
                              </td>
                            </tr>
                            <tr>
                              <td height="20"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- End Footer -->
              </tbody>
            </table>
          </div>
        </body>
      </html>
      `,
      subject: "New Quote",
    });

    // A full quote was submitted: record the completion so the grace-window
    // sweeper suppresses this customer's partial lead instead of delivering it
    // to Zapier as an "abandoned" lead. Matched on session/email/phone.
    try {
      await markQuoteCompleted({
        sessionId: res?.sessionId,
        email: res?.data?.shipment_details?.email,
        phone: res?.data?.shipment_details?.phone,
      });
    } catch (markErr) {
      // Never let lead bookkeeping break the customer-facing submit.
      console.error("[send_email] markQuoteCompleted failed", markErr);
    }

    return NextResponse.json({ message: "Mail Sent", ok: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
