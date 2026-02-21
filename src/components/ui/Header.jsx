import React from 'react';
import Icon from '../AppIcon';

const Header = ({ utilityLinks = [] }) => {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-logo">
          <div className="header-logo-icon">
            <Icon name="FileText" size={24} color="white" />
          </div>
          <span className="header-logo-text">ContractGenerator</span>
        </div>
        
        {utilityLinks?.length > 0 && (
          <nav className="header-actions">
            {utilityLinks?.map((link, index) => (
              <a
                key={index}
                href={link?.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                target={link?.external ? '_blank' : undefined}
                rel={link?.external ? 'noopener noreferrer' : undefined}
              >
                {link?.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;