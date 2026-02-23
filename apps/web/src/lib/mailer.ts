import nodemailer from "nodemailer";

// Creates a transporter strictly for basic local/development testing via Ethereal or specific SMTP variables
// To use a provider like Sendgrid, configure these process.env variables.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
        user: process.env.SMTP_USER || "test_user",
        pass: process.env.SMTP_PASS || "test_password",
    },
});

export async function sendEmployeeInviteEmail(
    employeeEmail: string,
    employeeName: string,
    employeeCode: string,
    temporaryPassword: string
) {
    try {
        const info = await transporter.sendMail({
            from: '"Workforce Core Admin" <admin@workforce-core.local>',
            to: employeeEmail,
            subject: "Welcome to Workforce Core! Your Account Details",
            text: `Hello ${employeeName},\n\nYou have been invited to join Workforce Core. Your employee code is ${employeeCode}.\n\nPlease log in using this email address and your temporary password: ${temporaryPassword}\n\nPlease update your password after logging in and complete your facial recognition setup via the desktop application.\n\nBest regards,\nThe Workforce Core Team`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1D4ED8;">Welcome to Workforce Core!</h2>
          <p>Hello <strong>${employeeName}</strong>,</p>
          <p>You have been invited to join the Workforce Core platform by your administrator.</p>
          <p>Here are your account details:</p>
          <ul>
            <li><strong>Employee Code:</strong> ${employeeCode}</li>
            <li><strong>Email (Login):</strong> ${employeeEmail}</li>
            <li><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></li>
          </ul>
          <p>Please log in using your temporary password and verify your facial recognition data through the Desktop Client to clock in.</p>
          <br />
          <p>Best regards,<br/>The Workforce Core Team</p>
        </div>
      `,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
