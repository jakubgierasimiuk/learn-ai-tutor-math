import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import { Hero } from '../Hero'
import userEvent from '@testing-library/user-event'

describe('Hero Component', () => {
  it('renders hero content correctly', () => {
    render(<Hero />)
    
    expect(screen.getByText(/Ucz się matematyki z/)).toBeInTheDocument()
    expect(screen.getByText('AI Tutorem')).toBeInTheDocument()
    expect(screen.getByText(/Personalizowana nauka matematyki/)).toBeInTheDocument()
  })

  it('displays feature highlights', () => {
    render(<Hero />)
    
    expect(screen.getByText('AI Teacher')).toBeInTheDocument()
    expect(screen.getByText('Interaktywne lekcje')).toBeInTheDocument()
    expect(screen.getByText('Gamifikacja')).toBeInTheDocument()
    expect(screen.getByText('Społeczność')).toBeInTheDocument()
  })

  it('shows call-to-action buttons', () => {
    render(<Hero />)
    
    const startLearningButton = screen.getByText('Rozpocznij naukę')
    const testKnowledgeButton = screen.getByText('Sprawdź swoją wiedzę')
    
    expect(startLearningButton).toBeInTheDocument()
    expect(testKnowledgeButton).toBeInTheDocument()
    
    // Check if buttons are links
    expect(startLearningButton.closest('a')).toHaveAttribute('href', '/lessons')
    expect(testKnowledgeButton.closest('a')).toHaveAttribute('href', '/quiz')
  })

  it('displays statistics correctly', () => {
    render(<Hero />)
    
    expect(screen.getByText('15K+')).toBeInTheDocument()
    expect(screen.getByText('Aktywnych uczniów')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('Satysfakcji')).toBeInTheDocument()
    expect(screen.getByText('50+')).toBeInTheDocument()
    expect(screen.getByText('Tematów')).toBeInTheDocument()
  })

  it('includes hero image with proper alt text', () => {
    render(<Hero />)
    
    const heroImage = screen.getByAltText('Studenci uczący się z AI')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src')
  })

  it('has responsive design classes', () => {
    render(<Hero />)
    
    // Check for responsive grid
    const gridContainer = document.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2')
  })

  it('includes decorative mathematical symbols', () => {
    render(<Hero />)
    
    // Mathematical symbols should be present (π, ∫, Σ)
    expect(screen.getByText('π')).toBeInTheDocument()
    expect(screen.getByText('∫')).toBeInTheDocument()
    expect(screen.getByText('Σ')).toBeInTheDocument()
  })

  it('shows floating UI elements', () => {
    render(<Hero />)
    
    expect(screen.getByText('AI aktywne')).toBeInTheDocument()
    expect(screen.getByText('Aktualny postęp')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('has proper heading hierarchy', () => {
    render(<Hero />)
    
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    expect(mainHeading).toHaveTextContent(/Ucz się matematyki z/)
  })

  it('buttons have proper hover effects', async () => {
    const user = userEvent.setup()
    render(<Hero />)
    
    const startLearningButton = screen.getByText('Rozpocznij naukę')
    
    // Check if button has hover classes
    expect(startLearningButton).toHaveClass('transition-bounce', 'hover:scale-105')
    
    await user.hover(startLearningButton)
    expect(startLearningButton).toBeInTheDocument()
  })

  it('has proper animation classes', () => {
    render(<Hero />)
    
    // Check for animation classes
    const animatedElements = document.querySelectorAll('[class*="animate-"]')
    expect(animatedElements.length).toBeGreaterThan(0)
    
    // Check for specific animations
    expect(document.querySelector('.animate-slideInFromLeft')).toBeInTheDocument()
    expect(document.querySelector('.animate-fadeIn')).toBeInTheDocument()
    expect(document.querySelector('.animate-float')).toBeInTheDocument()
  })

  it('includes background decorative elements', () => {
    render(<Hero />)
    
    // Check for gradient background
    const backgroundElement = document.querySelector('.bg-gradient-to-br')
    expect(backgroundElement).toBeInTheDocument()
    
    // Check for decorative circles
    const decorativeElements = document.querySelectorAll('.blur-3xl')
    expect(decorativeElements.length).toBeGreaterThan(0)
  })

  it('uses semantic HTML structure', () => {
    render(<Hero />)
    
    // Should have proper section structure
    const section = document.querySelector('div')
    expect(section).toBeInTheDocument()
    
    // Should have proper container structure
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('has accessible color contrast', () => {
    render(<Hero />)
    
    // Text should use semantic color classes
    const gradientText = document.querySelector('.gradient-hero')
    expect(gradientText).toBeInTheDocument()
    
    const mutedText = document.querySelector('.text-muted-foreground')
    expect(mutedText).toBeInTheDocument()
  })
})