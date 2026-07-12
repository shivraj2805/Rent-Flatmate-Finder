const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

/**
 * Dispatch an email notification using SMTP configuration
 * Falls back gracefully to logging warnings if variables are not provided
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content of the email
 */
const sendEmail = async ({ to, subject, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(`[Email Service Bypass] SMTP host/user/pass is not configured in .env. Logging email details:`)
    console.warn(`- To: ${to}`)
    console.warn(`- Subject: ${subject}`)
    return
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // Use SSL for port 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    const fromSender = SMTP_FROM || '"RoomSync Alerts" <no-reply@roomsync.com>'

    await transporter.sendMail({
      from: fromSender,
      to,
      subject,
      html,
    })

    console.log(`[Email Service] Successfully sent email to ${to}`)
  } catch (err) {
    console.error(`[Email Service Error] Failed to send email to ${to}:`, err.message)
  }
}

/**
 * Send alert to listing owner when a high compatibility roommate match is evaluated (>80%)
 */
const sendHighCompatibilityEmail = async (owner, tenant, listing, score, explanation) => {
  try {
    const templatePath = path.join(__dirname, '../templates/compatibilityAlert.html')
    let htmlContent = fs.readFileSync(templatePath, 'utf-8')

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    htmlContent = htmlContent
      .replace(/{{ownerName}}/g, owner.name)
      .replace(/{{tenantName}}/g, tenant.name)
      .replace(/{{listingTitle}}/g, listing.title)
      .replace(/{{compatibilityScore}}/g, String(score))
      .replace(/{{explanation}}/g, explanation)
      .replace(/{{link}}/g, `${clientUrl}/dashboard/owner/requests`)

    await sendEmail({
      to: owner.email,
      subject: `🔥 High Roommate Match Alert: ${score}% Match for ${listing.title}`,
      html: htmlContent,
    })
  } catch (err) {
    console.error(`[Email Service error loading compatibility template]`, err.message)
  }
}

/**
 * Send alert to tenant when their interest request status has been accepted or declined
 */
const sendInterestStatusEmail = async (tenant, owner, listing, status, responseMessage) => {
  try {
    const templatePath = path.join(__dirname, '../templates/interestStatus.html')
    let htmlContent = fs.readFileSync(templatePath, 'utf-8')

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const statusClass = status === 'accepted' ? 'accepted' : 'declined'
    const isAccepted = status === 'accepted'
    const link = isAccepted 
      ? `${clientUrl}/dashboard/tenant/chats` 
      : `${clientUrl}/dashboard/tenant/requests`

    htmlContent = htmlContent
      .replace(/{{tenantName}}/g, tenant.name)
      .replace(/{{ownerName}}/g, owner.name)
      .replace(/{{listingTitle}}/g, listing.title)
      .replace(/{{status}}/g, status)
      .replace(/{{statusClass}}/g, statusClass)
      .replace(/{{link}}/g, link)

    // Handle optional response message conditional
    if (responseMessage) {
      htmlContent = htmlContent
        .replace('{{#if responseMessage}}', '')
        .replace('{{/if}}', '')
        .replace(/{{responseMessage}}/g, responseMessage)
    } else {
      // Remove conditional block entirely if responseMessage is empty
      const regex = /{{#if responseMessage}}[\s\S]*?{{\/if}}/g
      htmlContent = htmlContent.replace(regex, '')
    }

    // Handle accepted message conditionals
    if (isAccepted) {
      htmlContent = htmlContent
        .replace('{{#if isAccepted}}', '')
        .replace('{{/if}}', '')
        .replace('isAccepted', 'true') // safety fallback
    } else {
      const regex = /{{#if isAccepted}}[\s\S]*?{{\/if}}/g
      htmlContent = htmlContent.replace(regex, '')
    }

    await sendEmail({
      to: tenant.email,
      subject: `RoomSync interest request has been ${status.toUpperCase()} for ${listing.title}`,
      html: htmlContent,
    })
  } catch (err) {
    console.error(`[Email Service error loading interest template]`, err.message)
  }
}

module.exports = {
  sendHighCompatibilityEmail,
  sendInterestStatusEmail,
  sendEmail,
}
