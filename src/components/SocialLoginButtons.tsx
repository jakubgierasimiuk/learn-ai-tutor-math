import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FaGoogle, FaFacebook } from "react-icons/fa";

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
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
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
      
      <Button
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading}
        variant="outline"
        className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 border-0 text-white"
      >
        <FaFacebook className="w-5 h-5 mr-3" />
        {loading ? "Logowanie..." : "Kontynuuj z Facebook"}
      </Button>
    </div>
  );
};