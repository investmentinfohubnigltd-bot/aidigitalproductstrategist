import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'AIDS Website <website@aidigitalproductstrategist.com>',
      to: ['hello@aidigitalproductstrategist.com'],
      replyTo: email,
      subject: `New enquiry from ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0C0B09; color: #F2EDE4;">
          <h2 style="color: #B8965A; font-weight: 300; font-size: 28px; margin-bottom: 32px;">New Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2720; color: #5A5650; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; width: 100px;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2720;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2720; color: #5A5650; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2720;"><a href="mailto:${email}" style="color: #B8965A;">${email}</a></td>
            </tr>
          </table>
          <div style="margin-top: 32px;">
            <p style="color: #5A5650; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;">Message</p>
            <p style="color: #9A9490; line-height: 1.9; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    // Auto-reply to sender
    await resend.emails.send({
      from: 'AI Digital Product Strategist <hello@aidigitalproductstrategist.com>',
      to: [email],
      subject: 'Message received — I\'ll be in touch.',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0C0B09; color: #F2EDE4;">
          <h2 style="color: #B8965A; font-weight: 300; font-style: italic; font-size: 32px; margin-bottom: 24px;">Message received.</h2>
          <p style="color: #9A9490; line-height: 1.9; margin-bottom: 24px;">Hi ${name}, thank you for reaching out. I've received your message and will be in touch within 24 hours.</p>
          <p style="color: #9A9490; line-height: 1.9;">In the meantime, you can follow me on Instagram for updates and insights:</p>
          <p style="margin-top: 16px;"><a href="https://instagram.com/aidigitalproductstrategist" style="color: #B8965A; text-decoration: none;">@aidigitalproductstrategist</a></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
