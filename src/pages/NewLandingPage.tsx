import React, { useState, useEffect } from 'react';
import { ChevronDown, Star, CheckCircle, ArrowRight, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Seo } from '@/components/Seo';
import { useLanguage } from '@/hooks/useLanguage';

// Language context
interface LanguageOption {
  code: 'pl' | 'uk';
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

const NewLandingPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const handleCTAClick = (source: string) => {
    // Track analytics
    console.log(`CTA clicked from: ${source}`);
    navigate(`/auth?trial=true&lang=${language}`);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <>
      <Seo 
        title="Mentavo AI - Inteligentna nauka matematyki z AI tutorem"
        description="Spersonalizowany tutor matematyczny dostępny 24/7. 7 dni za darmo, później tylko 49,99 zł/miesiąc. Dostosowuje się do Twojego stylu nauki."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl text-foreground">Mentavo AI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">
                Funkcje
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Cennik
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </button>
              
              {/* Language Switcher */}
              <div className="flex items-center space-x-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center w-10 h-10 rounded-md text-xl transition-all duration-200 ${
                      language === lang.code
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-muted'
                    }`}
                    title={lang.name}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/auth?lang=${language}`)}
              >
                {t.login}
              </Button>
              <Button 
                onClick={() => handleCTAClick('header')}
                className="bg-gradient-primary hover:opacity-90"
              >
                {t.startTrial}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-sm border-b">
              <nav className="container mx-auto px-4 py-4 space-y-4">
                <button onClick={() => scrollToSection('features')} className="block w-full text-left text-muted-foreground hover:text-foreground">
                  Funkcje
                </button>
                <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-muted-foreground hover:text-foreground">
                  Cennik
                </button>
                <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-muted-foreground hover:text-foreground">
                  FAQ
                </button>
                <div className="flex justify-center space-x-2 pt-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-center w-12 h-12 rounded-md text-2xl transition-all duration-200 ${
                        language === lang.code
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-muted'
                      }`}
                      title={lang.name}
                    >
                      {lang.flag}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-4 pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/auth?lang=${language}`)}
                    className="flex-1"
                  >
                    {t.login}
                  </Button>
                  <Button 
                    onClick={() => handleCTAClick('mobile-header')}
                    className="flex-1 bg-gradient-primary hover:opacity-90"
                  >
                    {t.startTrial}
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-hero">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary">
                🚀 Nowa era nauki matematyki
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.heroTitle}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Hero Features */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {t.heroFeature1}
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {t.heroFeature2}
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {t.heroFeature3}
                </Badge>
              </div>

              {/* Hero CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => handleCTAClick('hero-primary')}
                  className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 h-auto"
                >
                  {t.startFreeTrial}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => scrollToSection('features')}
                  className="text-lg px-8 py-6 h-auto"
                >
                  {t.learnMore}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.problemTitle}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💸</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.problemHigh}</h3>
                  <p className="text-muted-foreground">{t.problemHighDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.problemTime}</h3>
                  <p className="text-muted-foreground">{t.problemTimeDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📏</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.problemPersonal}</h3>
                  <p className="text-muted-foreground">{t.problemPersonalDesc}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t.solutionTitle}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.solutionAvailable}</h3>
                  <p className="text-muted-foreground">{t.solutionAvailableDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.solutionPersonalized}</h3>
                  <p className="text-muted-foreground">{t.solutionPersonalizedDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.solutionAffordable}</h3>
                  <p className="text-muted-foreground">{t.solutionAffordableDesc}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.featuresTitle}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.featureAI}</h3>
                  <p className="text-muted-foreground">{t.featureAIDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.featureProgress}</h3>
                  <p className="text-muted-foreground">{t.featureProgressDesc}</p>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mb-4 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🎮</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t.featureExercises}</h3>
                  <p className="text-muted-foreground">{t.featureExercisesDesc}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.testimonialsTitle}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{t.testimonial1}"</p>
                  <p className="font-semibold">{t.testimonial1Author}</p>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{t.testimonial2}"</p>
                  <p className="font-semibold">{t.testimonial2Author}</p>
                </CardContent>
              </Card>
              
              <Card className="p-6">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{t.testimonial3}"</p>
                  <p className="font-semibold">{t.testimonial3Author}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.pricingTitle}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Trial */}
              <Card className="p-8 border-2 border-green-200">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🆓</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t.pricingFree}</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">{t.pricingFreeDays}</div>
                  <p className="text-muted-foreground mb-6">{t.pricingFreeDesc}</p>
                  <Button 
                    onClick={() => handleCTAClick('pricing-free')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {t.startNow}
                  </Button>
                </CardContent>
              </Card>

              {/* Paid Plan */}
              <Card className="p-8 border-2 border-primary shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary">Najpopularniejszy</Badge>
                </div>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">⭐</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t.pricingPaid}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">{t.pricingPaidPrice}</div>
                  <p className="text-muted-foreground mb-6">{t.pricingPaidDesc}</p>
                  
                  <div className="space-y-2 mb-6 text-left">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{t.pricingFeature1}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{t.pricingFeature2}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{t.pricingFeature3}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{t.pricingFeature4}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleCTAClick('pricing-paid')}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    {t.startNow}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t.faqTitle}
              </h2>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {t.faq1Q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t.faq1A}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {t.faq2Q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t.faq2A}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {t.faq3Q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t.faq3A}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {t.faq4Q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t.faq4A}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Zacznij naukę już dziś!
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Dołącz do tysięcy uczniów, którzy już poprawili swoje oceny dzięki Mentavo AI
              </p>
              <Button 
                size="lg"
                onClick={() => handleCTAClick('final-cta')}
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6 h-auto"
              >
                Rozpocznij 7-dniowy darmowy trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-muted/50 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="font-bold text-xl">Mentavo AI</span>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-muted-foreground">
                  <a href="/privacy-policy" className="hover:text-foreground transition-colors">
                    {t.footerPrivacy}
                  </a>
                  <a href="/terms-of-service" className="hover:text-foreground transition-colors">
                    {t.footerTerms}
                  </a>
                  <a href="mailto:kontakt@mentavo.ai" className="hover:text-foreground transition-colors">
                    {t.footerContact}
                  </a>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                {t.footerRights}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NewLandingPage;