/**
 * Translate Supabase auth error messages to Polish
 */
export const translateAuthError = (errorMessage: string): string => {
  const errorTranslations: { [key: string]: string } = {
    "User already registered": "Użytkownik już istnieje",
    "Email not confirmed": "Email nie został potwierdzony",
    "Invalid login credentials": "Nieprawidłowe dane logowania",
    "Password should be at least 6 characters": "Hasło powinno mieć co najmniej 6 znaków",
    "Email address not valid": "Nieprawidłowy adres email",
    "Password is too weak": "Hasło jest za słabe",
    "Invalid email": "Nieprawidłowy email",
    "Invalid password": "Nieprawidłowe hasło",
    "Email already exists": "Email już istnieje",
    "Email already taken": "Email już jest zajęty",
    "Account already exists": "Konto już istnieje",
    "User not found": "Użytkownik nie znaleziony",
    "Email rate limit exceeded": "Przekroczono limit wysyłania emaili",
    "Too many requests": "Zbyt wiele żądań",
    "Signup disabled": "Rejestracja wyłączona",
    "Email confirmation required": "Wymagane potwierdzenie email",
    "Password reset required": "Wymagane zresetowanie hasła",
    "OAuth provider not enabled": "Logowanie przez tego dostawcę nie jest włączone",
    "OAuth error": "Błąd logowania przez zewnętrznego dostawcę"
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
