import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle, FaFacebook } from "react-icons/fa";

// Function to translate Supabase auth errors to Polish
const translateAuthError = (errorMessage: string): string => {
  const errorTranslations: { [key: string]: string } = {
    "User already registered": "Użytkownik już istnieje",
    "Email not confirmed": "Email nie został potwierdzony", 
    "Invalid login credentials": "Nieprawidłowe dane logowania",
    "Email already exists": "Email już istnieje",
    "Account already exists": "Konto już istnieje",
    "User not found": "Użytkownik nie znaleziony",
    "Email rate limit exceeded": "Przekroczono limit wysyłania emaili",
    "Too many requests": "Zbyt wiele żądań",
    "OAuth provider not enabled": "Logowanie przez Google nie jest włączone",
    "OAuth error": "Błąd logowania przez Google"
  };

  // Check for exact matches first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Check for partial matches (case insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [englishError, polishError] of Object.entries(errorTranslations)) {
    if (lowerMessage.includes(englishError.toLowerCase())) {
      return polishError;
    }
  }

  // If no translation found, return original message
  return errorMessage;
};

interface SocialLoginButtonsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const SocialLoginButtons = ({ loading, setLoading }: SocialLoginButtonsProps) => {
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Błąd logowania",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas logowania",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleSocialLogin('google')}
        disabled={loading}
        variant="outline"
        className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
      >
        <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
        {loading ? "Logowanie..." : "Kontynuuj z Google"}
      </Button>
      
      {/* Facebook login temporarily hidden */}
      {/* <Button
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading}
        variant="outline"
        className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 border-0 text-white"
      >
        <FaFacebook className="w-5 h-5 mr-3" />
        {loading ? "Logowanie..." : "Kontynuuj z Facebook"}
      </Button> */}
    </div>
  );
};