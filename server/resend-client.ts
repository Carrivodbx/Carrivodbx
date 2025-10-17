import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    if (!resend) {
      console.warn('RESEND_API_KEY not configured - password reset email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = process.env.EMAIL_FROM || 'Carivoo <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Réinitialisation de votre mot de passe - Carivoo',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #c0c0c0;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 40px 30px;
                border-left: 1px solid #e0e0e0;
                border-right: 1px solid #e0e0e0;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
                color: #c0c0c0 !important;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
                border: 1px solid #404040;
                transition: all 0.3s ease;
              }
              .button:hover {
                background: linear-gradient(135deg, #3d3d3d 0%, #2a2a2a 100%);
                border-color: #505050;
              }
              .footer {
                background: #f5f5f5;
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-radius: 0 0 8px 8px;
                border: 1px solid #e0e0e0;
              }
              .warning {
                background: #fff8e1;
                border-left: 4px solid #ffa726;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">CARIVOO</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #a0a0a0;">Location de véhicules de luxe</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1a1a1a; margin-top: 0;">Réinitialisation de votre mot de passe</h2>
              
              <p>Bonjour,</p>
              
              <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Carivoo. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valable pendant <strong>1 heure</strong> seulement.
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br>
                <a href="${resetLink}" style="color: #2d2d2d; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Carivoo - Plateforme de location de véhicules de luxe
              </p>
              <p style="margin: 10px 0 0 0;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Password reset email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
