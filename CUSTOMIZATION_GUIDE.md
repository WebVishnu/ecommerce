# Company Customization Guide

This guide explains how to customize the Shivangi Battery Ecommerce project for any company by modifying the configuration file.

## Quick Start

1. **Edit the configuration file**: Modify `src/config/company-config.json`
2. **Update assets**: Replace logo images in the `public/` folder
3. **Deploy**: The changes will automatically apply throughout the application

## Configuration File Structure

The main configuration file is located at `src/config/company-config.json`. This file contains all customizable elements:

### 1. Company Information

```json
{
  "company": {
    "name": "Your Company Name",
    "shortName": "Short Name",
    "tagline": "Your Company Tagline",
    "description": "Company description",
    "website": "https://yourcompany.com",
    "founded": "2020"
  }
}
```

### 2. Contact Information

```json
{
  "contact": {
    "phone": {
      "primary": "+91 98765 43210",
      "secondary": "+91 98765 43211",
      "whatsapp": "+91 98765 43210"
    },
    "email": {
      "primary": "info@yourcompany.com",
      "support": "support@yourcompany.com",
      "sales": "sales@yourcompany.com"
    },
    "address": {
      "street": "123 Your Street",
      "city": "Your City",
      "state": "Your State",
      "pincode": "123456",
      "country": "Your Country",
      "full": "Complete address string"
    },
    "businessHours": {
      "monday": "9:00 AM - 6:00 PM",
      "tuesday": "9:00 AM - 6:00 PM",
      "wednesday": "9:00 AM - 6:00 PM",
      "thursday": "9:00 AM - 6:00 PM",
      "friday": "9:00 AM - 6:00 PM",
      "saturday": "9:00 AM - 4:00 PM",
      "sunday": "Closed"
    }
  }
}
```

### 3. Branding & Colors

```json
{
  "branding": {
    "colors": {
      "primary": {
        "main": "#FF6B35",
        "light": "#FF8A65",
        "dark": "#E64A19",
        "contrast": "#FFFFFF"
      },
      "secondary": {
        "main": "#2E7D32",
        "light": "#4CAF50",
        "dark": "#1B5E20",
        "contrast": "#FFFFFF"
      },
      "accent": {
        "main": "#FFC107",
        "light": "#FFD54F",
        "dark": "#FF8F00",
        "contrast": "#000000"
      },
      "background": {
        "primary": "#FFFFFF",
        "secondary": "#F5F5F5",
        "tertiary": "#FFF8F0",
        "dark": "#212121"
      },
      "text": {
        "primary": "#212121",
        "secondary": "#757575",
        "disabled": "#BDBDBD",
        "inverse": "#FFFFFF"
      },
      "status": {
        "success": "#4CAF50",
        "warning": "#FF9800",
        "error": "#F44336",
        "info": "#2196F3"
      }
    },
    "logo": {
      "primary": "/logo.png",
      "secondary": "/logo-white.png",
      "favicon": "/favicon.ico",
      "alt": "Your Company Logo"
    },
    "fonts": {
      "primary": "Inter, sans-serif",
      "secondary": "Poppins, sans-serif",
      "mono": "GeistMonoVF, monospace"
    }
  }
}
```

### 4. Social Media Links

```json
{
  "social": {
    "facebook": "https://facebook.com/yourcompany",
    "instagram": "https://instagram.com/yourcompany",
    "twitter": "https://twitter.com/yourcompany",
    "linkedin": "https://linkedin.com/company/yourcompany",
    "youtube": "https://youtube.com/yourcompany"
  }
}
```

### 5. Features Configuration

```json
{
  "features": {
    "enableOTP": true,
    "enableWhatsApp": true,
    "enableReviews": true,
    "enableWishlist": true,
    "enableCompare": true,
    "enableNewsletter": true,
    "enableLiveChat": false,
    "enableMultiLanguage": false,
    "enableMultiCurrency": false
  }
}
```

### 6. SEO Information

```json
{
  "seo": {
    "title": "Your Company - Quality Products & Solutions",
    "description": "Shop for high-quality products. Fast delivery, expert support, and competitive prices.",
    "keywords": "your, products, solutions, keywords",
    "author": "Your Company",
    "ogImage": "/og-image.jpg"
  }
}
```

### 7. Payment & Shipping

```json
{
  "payment": {
    "methods": ["cod", "online", "upi", "card"],
    "currencies": ["INR"],
    "taxRate": 18,
    "shipping": {
      "freeThreshold": 1000,
      "baseRate": 100,
      "expressRate": 200
    }
  }
}
```

### 8. Content

```json
{
  "content": {
    "hero": {
      "title": "Your Hero Title",
      "subtitle": "Your hero subtitle description",
      "cta": "Shop Now"
    },
    "about": {
      "title": "About Your Company",
      "description": "Your company description",
      "highlights": [
        "Quality Products",
        "Expert Support",
        "Fast Delivery",
        "Competitive Prices"
      ]
    },
    "footer": {
      "description": "Your footer description",
      "quickLinks": [
        "About Us",
        "Products",
        "Contact",
        "Support"
      ]
    }
  }
}
```

### 9. Product Categories

```json
{
  "categories": [
    {
      "id": "category1",
      "name": "Category Name",
      "description": "Category description",
      "icon": "car"
    }
  ]
}
```

## Logo Requirements

Place your logo files in the `public/` directory:

- **Primary Logo**: `public/logo.png` (for light backgrounds)
- **Secondary Logo**: `public/logo-white.png` (for dark backgrounds)
- **Favicon**: `public/favicon.ico`

### Logo Specifications

- **Primary Logo**: PNG format, transparent background, recommended size 200x60px
- **Secondary Logo**: PNG format, white version for dark backgrounds
- **Favicon**: ICO format, 16x16px, 32x32px, and 48x48px

## Color Scheme Guidelines

### Primary Colors
- Choose a primary color that represents your brand
- Ensure good contrast with white text
- Consider accessibility (WCAG guidelines)

### Secondary Colors
- Complementary to your primary color
- Used for accents and highlights

### Background Colors
- Light, neutral backgrounds for content areas
- Consistent with your brand palette

## Category Customization

Update the categories array to match your product offerings:

```json
{
  "categories": [
    {
      "id": "electronics",
      "name": "Electronics",
      "description": "Electronic products and gadgets",
      "icon": "zap"
    },
    {
      "id": "clothing",
      "name": "Clothing",
      "description": "Fashion and apparel",
      "icon": "shirt"
    }
  ]
}
```

### Available Icons

The following icons are available for categories:
- `car` - Automotive
- `zap` - Electronics/Power
- `shield` - Security/Protection
- `sun` - Solar/Renewable Energy
- `factory` - Industrial
- `home` - Home & Garden
- `shirt` - Fashion
- `phone` - Mobile/Communication

## Business Hours

Customize your business hours for each day of the week:

```json
{
  "businessHours": {
    "monday": "9:00 AM - 6:00 PM",
    "tuesday": "9:00 AM - 6:00 PM",
    "wednesday": "9:00 AM - 6:00 PM",
    "thursday": "9:00 AM - 6:00 PM",
    "friday": "9:00 AM - 6:00 PM",
    "saturday": "9:00 AM - 4:00 PM",
    "sunday": "Closed"
  }
}
```

## Features Toggle

Enable or disable specific features:

- `enableOTP`: Phone number verification
- `enableWhatsApp`: WhatsApp integration
- `enableReviews`: Product reviews
- `enableWishlist`: Customer wishlists
- `enableCompare`: Product comparison
- `enableNewsletter`: Newsletter subscription
- `enableLiveChat`: Live chat support
- `enableMultiLanguage`: Multiple language support
- `enableMultiCurrency`: Multiple currency support

## Payment Methods

Configure accepted payment methods:

```json
{
  "payment": {
    "methods": ["cod", "online", "upi", "card", "netbanking"],
    "currencies": ["INR", "USD"],
    "taxRate": 18
  }
}
```

## Shipping Configuration

Set up shipping rates and thresholds:

```json
{
  "shipping": {
    "freeThreshold": 1000,
    "baseRate": 100,
    "expressRate": 200
  }
}
```

## SEO Optimization

Update SEO information for better search engine visibility:

```json
{
  "seo": {
    "title": "Your Company - Quality Products & Solutions",
    "description": "Comprehensive description of your business and offerings",
    "keywords": "relevant, keywords, for, your, business",
    "author": "Your Company Name",
    "ogImage": "/og-image.jpg"
  }
}
```

## Social Media Integration

Add your social media profiles:

```json
{
  "social": {
    "facebook": "https://facebook.com/yourcompany",
    "instagram": "https://instagram.com/yourcompany",
    "twitter": "https://twitter.com/yourcompany",
    "linkedin": "https://linkedin.com/company/yourcompany",
    "youtube": "https://youtube.com/yourcompany"
  }
}
```

## Testing Your Changes

After updating the configuration:

1. **Start the development server**: `npm run dev`
2. **Check the homepage**: Verify colors, logo, and content
3. **Test navigation**: Ensure all links work correctly
4. **Verify contact information**: Check phone numbers and addresses
5. **Test responsive design**: View on mobile and desktop

## Deployment

When deploying to production:

1. **Update configuration**: Modify `company-config.json` with production values
2. **Upload assets**: Ensure all logo files are in the public directory
3. **Build the project**: `npm run build`
4. **Deploy**: The configuration will be included in the build

## Troubleshooting

### Colors Not Updating
- Clear browser cache
- Check for CSS conflicts
- Verify color format (hex codes)

### Logo Not Displaying
- Ensure file paths are correct
- Check file format (PNG recommended)
- Verify file permissions

### Contact Information Issues
- Test phone number format
- Verify email addresses
- Check address formatting

### Categories Not Showing
- Ensure category IDs are unique
- Check icon names match available options
- Verify JSON syntax

## Advanced Customization

### Custom CSS Variables

You can add custom CSS variables to the configuration for advanced styling:

```json
{
  "branding": {
    "customCSS": {
      "--custom-border-radius": "8px",
      "--custom-shadow": "0 4px 6px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

### Dynamic Content

The configuration supports dynamic content that can be updated without rebuilding:

```json
{
  "content": {
    "announcements": [
      "Free shipping on orders over ₹1000",
      "New products arriving next week"
    ]
  }
}
```

## Support

For additional customization needs:

1. **Check the documentation**: Review component files for implementation details
2. **Examine the codebase**: Look at how configuration is used in components
3. **Contact support**: Reach out for complex customization requirements

## Best Practices

1. **Backup your configuration**: Keep a copy of your working configuration
2. **Test thoroughly**: Verify all changes work across devices
3. **Use consistent branding**: Maintain color and style consistency
4. **Optimize images**: Compress logo files for faster loading
5. **Validate JSON**: Use a JSON validator to check syntax
6. **Version control**: Track configuration changes in your version control system

This configuration system makes it easy to customize the entire application for any company by simply updating a single JSON file. 