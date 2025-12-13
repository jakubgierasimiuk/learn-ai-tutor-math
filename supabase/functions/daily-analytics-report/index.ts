import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate date range (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    console.log(`Generating report for: ${yesterday.toISOString()} to ${now.toISOString()}`);

    // 1. Get page visits count
    const { count: pageVisitsCount, error: visitsError } = await supabase
      .from("page_analytics")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());
    
    if (visitsError) {
      console.error("Error fetching page visits:", visitsError);
    }

    // 2. Get new free accounts count
    const { count: freeAccountsCount, error: freeError } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("subscription_type", "free")
      .gte("created_at", yesterday.toISOString());
    
    if (freeError) {
      console.error("Error fetching free accounts:", freeError);
    }

    // 3. Get new founding member accounts count
    const { count: foundingCount, error: foundingError } = await supabase
      .from("founding_members")
      .select("*", { count: "exact", head: true })
      .eq("status", "registered")
      .gte("created_at", yesterday.toISOString());
    
    if (foundingError) {
      console.error("Error fetching founding members:", foundingError);
    }

    // 4. Get new paid subscriptions count
    const { count: paidCount, error: paidError } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("subscription_type", "paid")
      .gte("created_at", yesterday.toISOString());
    
    if (paidError) {
      console.error("Error fetching paid subscriptions:", paidError);
    }

    // 5. Get founding page visits count
    const { count: foundingPageVisitsCount, error: foundingVisitsError } = await supabase
      .from("page_analytics")
      .select("*", { count: "exact", head: true })
      .like("route", "/founding%")
      .gte("created_at", yesterday.toISOString());
    
    if (foundingVisitsError) {
      console.error("Error fetching founding page visits:", foundingVisitsError);
    }

    // Format the report email
    const reportDate = yesterday.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #4A90E2 0%, #1E3A5F 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .metric-card {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .metric-label {
              font-size: 16px;
              color: #666;
              font-weight: 500;
            }
            .metric-value {
              font-size: 32px;
              font-weight: bold;
              color: #4A90E2;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .date {
              color: rgba(255,255,255,0.9);
              font-size: 14px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Raport Dzienny Mentavo AI</h1>
            <div class="date">${reportDate}</div>
          </div>
          <div class="content">
            <div class="metric-card">
              <div class="metric-label">👁️ Wizyty na stronie</div>
              <div class="metric-value">${pageVisitsCount || 0}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">🏆 Wizyty na Founding</div>
              <div class="metric-value">${foundingPageVisitsCount || 0}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">🆓 Nowe konta darmowe</div>
              <div class="metric-value">${freeAccountsCount || 0}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">⭐ Nowe konta founding</div>
              <div class="metric-value">${foundingCount || 0}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">💳 Wykupione subskrypcje</div>
              <div class="metric-value">${paidCount || 0}</div>
            </div>
          </div>
          <div class="footer">
            <p>Ten raport został wygenerowany automatycznie przez Mentavo AI</p>
            <p style="color: #999; font-size: 12px;">Dane za ostatnie 24 godziny</p>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Mentavo AI Reports <onboarding@resend.dev>",
      to: ["jakub.gierasimiuk@gmail.com"],
      subject: `📊 Raport Dzienny Mentavo AI - ${reportDate}`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        reportDate,
        metrics: {
          pageVisits: pageVisitsCount || 0,
          foundingPageVisits: foundingPageVisitsCount || 0,
          freeAccounts: freeAccountsCount || 0,
          foundingMembers: foundingCount || 0,
          paidSubscriptions: paidCount || 0,
        },
        emailResponse,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
