import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  action?: "create" | "set-password";
  email: string;
  full_name?: string;
  role?: "super_admin" | "org_admin" | "employee";
  organization_id?: string | null;
  invite_url?: string;
  password?: string;
  user_id?: string;
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
    const requestData: CreateUserRequest = await req.json();
    const { action = "create", email, full_name, role, organization_id, invite_url, password, user_id } = requestData;

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Action: Set password for existing user
    if (action === "set-password") {
      if (!user_id || !password) {
        throw new Error("Missing user_id or password");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: password,
        email_confirm: true, // Also confirm email when setting password
      });

      if (updateError) {
        throw updateError;
      }

      console.log("Password set successfully for user:", user_id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Password set successfully" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Action: Create new user (default)
    // Validate required fields for create
    if (!email || !full_name || !role) {
      throw new Error("Missing required fields for user creation");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Create user with admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: false,
      user_metadata: {
        full_name: full_name,
      },
    });

    if (userError) {
      throw userError;
    }

    if (!userData.user) {
      throw new Error("Failed to create user");
    }

    // Update user profile with role and organization
    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        full_name: full_name,
        role: role,
        organization_id: organization_id,
        is_super_admin: role === "super_admin",
      })
      .eq("id", userData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      // Don't throw - user was created, profile update can be retried
    }

    // Generate invite link
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: email,
      options: {
        redirectTo: invite_url,
      },
    });

    if (inviteError) {
      throw inviteError;
    }

    const inviteLink = inviteData?.properties?.action_link;

    // Get role display name
    const roleDisplayName = role === "super_admin" 
      ? "Super Administrator" 
      : role === "org_admin" 
      ? "Organisations-Administrator" 
      : "Mitarbeiter";

    // Send invitation email via Resend
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
          <h2 style="color: #1a1a1a; font-size: 20px; margin-top: 0;">Willkommen, ${full_name}!</h2>
          <p style="color: #666;">Sie wurden als <strong>${roleDisplayName}</strong> zu FUTURA TEAMS eingeladen.</p>
          
          <p style="color: #666;">Klicken Sie auf den Button unten, um Ihr Konto zu aktivieren und Ihr Passwort festzulegen:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #C9A227; color: #000; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">Konto aktivieren</a>
          </div>
          
          <p style="color: #888; font-size: 14px;">Dieser Link ist 24 Stunden gültig.</p>
        </div>
        
        <div style="background: #fff8e1; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #1a1a1a; font-size: 16px; margin-top: 0;">Was ist FUTURA TEAMS?</h3>
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">FUTURA TEAMS ist eine AI-gesteuerte Plattform zur Kompetenzentwicklung und Team-Intelligence. Analysieren Sie Skill-Gaps, entwickeln Sie Ihre Mitarbeiter und bereiten Sie Ihr Team auf die Zukunft vor.</p>
        </div>
        
        <div style="text-align: center; color: #888; font-size: 12px;">
          <p>Bei Fragen wenden Sie sich an Ihren Administrator.</p>
          <p>&copy; ${new Date().getFullYear()} FUTURA TEAMS. Alle Rechte vorbehalten.</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await sendEmail(
      email,
      "Willkommen bei FUTURA TEAMS - Ihre Einladung",
      emailHtml
    );

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      userId: userData.user.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in create-user-invitation function:", error);
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
