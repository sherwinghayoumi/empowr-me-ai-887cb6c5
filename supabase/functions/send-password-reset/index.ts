import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "FUTURA TEAMS <noreply@futura-teams.com>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email and resetUrl");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Generate password reset link using Supabase Admin API
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: resetUrl,
      },
    });

    if (resetError) {
      throw resetError;
    }

    const resetLink = resetData?.properties?.action_link;
    
    if (!resetLink) {
      throw new Error("Failed to generate reset link");
    }

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">FUTURA TEAMS</h1>
          <p style="color: #666; font-size: 14px;">AI-Driven Team Intelligence Platform</p>
        </div>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Passwort zurücksetzen</h2>
          <p style="color: #666;">Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort festzulegen:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #C9A227; color: #000; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">Passwort zurücksetzen</a>
          </div>
          
          <p style="color: #888; font-size: 14px;">Dieser Link ist 1 Stunde gültig.</p>
        </div>
        
        <div style="text-align: center; color: #888; font-size: 12px;">
          <p>Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
          <p>&copy; ${new Date().getFullYear()} FUTURA TEAMS. Alle Rechte vorbehalten.</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await sendEmail(
      email,
      "Passwort zurücksetzen - FUTURA TEAMS",
      emailHtml
    );

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
