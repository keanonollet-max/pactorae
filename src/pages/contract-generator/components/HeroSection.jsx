import React from 'react';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  return (
    <div className="text-center py-8 md:py-12 lg:py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 md:mb-8">
        <Icon name="FileText" size={32} color="white" className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
        Genereer in 30 seconden een professioneel contract
      </h1>
      
      <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Maak snel en eenvoudig juridisch correcte contracten zonder ingewikkelde registratie,Vul het formulier in en ontvang direct uw professionele overeenkomst.

      </p>
      
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 md:mt-8 text-sm md:text-base text-muted-foreground">
        <div className="flex items-center gap-2">
          <Icon name="Shield" size={20} color="var(--color-success)" />
          <span>Juridisch correct</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Zap" size={20} color="var(--color-accent)" />
          <span>In 30 seconden klaar</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Lock" size={20} color="var(--color-primary)" />
          <span>Geen account nodig</span>
        </div>
      </div>
    </div>);

};

export default HeroSection;