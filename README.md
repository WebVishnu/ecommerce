# Shivangi Battery Ecommerce Frontend

A modern ecommerce frontend built with Next.js and Apollo Client to connect with the Busiman GraphQL backend.

## Features

- 🛍️ **Product Catalog**: Display products from the GraphQL backend
- 🔍 **Search Functionality**: Search products by name, description, or category
- 🛒 **Shopping Cart**: Add products to cart with real-time updates
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **GraphQL Integration**: Real-time data fetching with Apollo Client
- 🎨 **Modern UI**: Clean and intuitive user interface

## Prerequisites

- Node.js 18+ 
- The Busiman backend server running on `localhost:4000`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

Make sure the Busiman backend server is running on `localhost:4000`. Navigate to the backend directory and start it:

```bash
cd ../../busiman\ server
npm run dev
```

### 3. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Apollo Provider
│   └── page.tsx           # Main homepage
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── ProductCard.tsx    # Individual product display
│   └── ProductGrid.tsx    # Product grid layout
├── graphql/              # GraphQL queries
│   └── queries/
│       └── products.ts    # Product-related queries
├── lib/                  # Utility libraries
│   ├── apollo-client.ts  # Apollo Client configuration
│   └── utils.ts          # Common utility functions
└── types/                # TypeScript type definitions
    └── product.ts        # Product interface types
```

## GraphQL Integration

The frontend connects to the Busiman backend GraphQL API at `http://localhost:4000/api/v2/graphql`. 

### Available Queries

- `GET_ALL_PRODUCTS`: Fetch all products with stock information
- `GET_PRODUCT_BY_ID`: Fetch a specific product by ID
- `GET_PRODUCTS_BY_CATEGORY`: Fetch products filtered by category

### Product Data Structure

Products include:
- Basic information (name, price, description)
- Stock levels across different stores
- Categories and specifications
- Serial numbers (for serializable products)

## Development

### Adding New Features

1. **New GraphQL Queries**: Add them to `src/graphql/queries/`
2. **New Components**: Create them in `src/components/`
3. **New Types**: Define them in `src/types/`

### Styling

The project uses Tailwind CSS for styling. Custom styles can be added to `src/app/globals.css`.

## Troubleshooting

### Backend Connection Issues

If you see "Error Loading Products":
1. Ensure the backend server is running on `localhost:4000`
2. Check that the GraphQL endpoint is accessible
3. Verify CORS settings in the backend

### Build Issues

If you encounter build errors:
1. Clear the `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `npm install`
3. Restart the development server

## API Endpoints

The frontend expects the following backend endpoints:

- **GraphQL**: `http://localhost:4000/api/v2/graphql`
- **Authentication**: `http://localhost:4000/api/v2/auth/*`
- **User Management**: `http://localhost:4000/api/v2/user/*`

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Test with the backend server running
# ecommerce
