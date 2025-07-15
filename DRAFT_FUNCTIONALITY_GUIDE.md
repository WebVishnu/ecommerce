# Draft Functionality Guide

## Overview

The draft functionality provides a comprehensive system for saving and managing product drafts before publishing them. This includes local storage auto-save, database persistence, and a complete draft management interface.

## Features

### 1. Auto-Save System
- **Local Storage**: Automatically saves form data to browser localStorage every 30 seconds
- **Database Persistence**: Saves drafts to MongoDB with draft status
- **Page Unload Protection**: Warns users before leaving with unsaved changes
- **Real-time Status**: Shows unsaved changes indicator and last saved timestamp

### 2. Draft Management
- **Draft Products Page**: View all draft products with completion status
- **Edit Drafts**: Continue editing existing drafts
- **Publish Drafts**: Convert drafts to published products
- **Delete Drafts**: Remove unwanted drafts
- **Completion Tracking**: Visual progress indicator for draft completion

### 3. User Experience
- **Seamless Recovery**: Automatically loads drafts when returning to the page
- **Visual Feedback**: Clear indicators for draft status and unsaved changes
- **Manual Save**: Manual save draft button for immediate saving
- **Form Validation**: Prevents publishing incomplete drafts

## Technical Implementation

### Database Schema Changes

The Product model has been extended with draft-related fields:

```typescript
interface IProduct {
  // ... existing fields
  isDraft: boolean;           // Indicates if product is a draft
  draftSavedAt?: Date;        // Timestamp of last draft save
}
```

### API Endpoints

#### 1. Draft Management (`/api/products/drafts`)
- `GET`: Fetch all draft products
- `POST`: Create new draft
- `PUT`: Update existing draft

#### 2. Draft Publishing (`/api/products/drafts/publish`)
- `POST`: Convert draft to published product

### Local Storage

Draft data is stored in localStorage with key `product_draft_data`:
```javascript
localStorage.setItem('product_draft_data', JSON.stringify(formData));
```

### Auto-Save Timer

Auto-save triggers every 30 seconds when there are unsaved changes:
```javascript
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
```

## Usage Guide

### Creating a New Draft

1. Navigate to `/admin/add-product`
2. Start filling out the product form
3. Data is automatically saved to localStorage every 30 seconds
4. Click "Save Draft" to manually save to database
5. Continue editing or leave the page (data will be preserved)

### Managing Drafts

1. Navigate to `/admin/drafts`
2. View all draft products with completion status
3. Click "Edit" to continue working on a draft
4. Click "Publish" to convert a complete draft to a published product
5. Click "Delete" to remove unwanted drafts

### Draft Recovery

- **Page Refresh**: Draft data is automatically loaded from localStorage
- **Browser Close/Reopen**: Draft data persists in localStorage
- **Edit Existing Draft**: Navigate to `/admin/add-product?draft=<draftId>`

### Publishing Drafts

1. Complete all required fields (name, description, price, category, brand, model, warranty, stock)
2. Navigate to draft management page
3. Click "Publish" on a complete draft
4. Draft is converted to published product and removed from drafts

## Completion Status

Drafts show completion percentage based on required fields:
- **100%**: All required fields filled - ready to publish
- **70-99%**: Almost complete - most fields filled
- **<70%**: Incomplete - many required fields missing

Required fields for 100% completion:
- Product Name
- Description
- Price
- Category
- Brand
- Model
- Stock Quantity

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── add-product/
│   │   │   └── page.tsx          # Enhanced with draft functionality
│   │   ├── drafts/
│   │   │   └── page.tsx          # New draft management page
│   │   ├── products/
│   │   │   └── page.tsx          # Updated with drafts link
│   │   └── page.tsx              # Updated with drafts quick action
│   └── api/
│       └── products/
│           ├── drafts/
│           │   ├── route.ts      # Draft CRUD operations
│           │   └── publish/
│           │       └── route.ts  # Draft publishing
│           └── route.ts          # Existing product routes
├── models/
│   └── Product.ts                # Updated with draft fields
└── types/
    └── product.ts                # Updated interfaces
```

## Configuration

### Auto-Save Interval
Modify the auto-save interval in `src/app/admin/add-product/page.tsx`:
```javascript
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
```

### Local Storage Key
Change the localStorage key if needed:
```javascript
const LOCAL_STORAGE_KEY = 'product_draft_data';
```

## Error Handling

The system includes comprehensive error handling:
- **localStorage Errors**: Graceful fallback if localStorage is unavailable
- **Network Errors**: User-friendly error messages for API failures
- **Validation Errors**: Clear feedback for incomplete drafts
- **Permission Errors**: Proper handling of admin access restrictions

## Security Considerations

- **Admin Access**: All draft functionality requires admin authentication
- **Data Validation**: Server-side validation for all draft operations
- **Input Sanitization**: Proper sanitization of user inputs
- **Access Control**: Drafts are only accessible to admin users

## Performance Optimizations

- **Debounced Auto-Save**: Prevents excessive API calls
- **Efficient Queries**: Indexed database queries for draft operations
- **Lazy Loading**: Draft data loaded only when needed
- **Memory Management**: Proper cleanup of timers and event listeners

## Troubleshooting

### Common Issues

1. **Drafts Not Saving**
   - Check browser localStorage support
   - Verify network connectivity
   - Check admin permissions

2. **Auto-Save Not Working**
   - Ensure no JavaScript errors in console
   - Check if form has unsaved changes
   - Verify timer is not being cleared

3. **Draft Recovery Issues**
   - Clear localStorage and try again
   - Check if draft ID is valid
   - Verify database connection

### Debug Information

Enable debug logging by checking browser console for:
- "Loaded draft from localStorage"
- "Saved to localStorage"
- "Draft saved successfully"
- "Loaded draft from database"

## Future Enhancements

Potential improvements for the draft system:
- **Draft Templates**: Pre-filled draft templates for common products
- **Draft Sharing**: Share drafts with team members
- **Draft Comments**: Add comments and notes to drafts
- **Draft Versioning**: Track multiple versions of drafts
- **Bulk Operations**: Bulk publish or delete drafts
- **Draft Analytics**: Track draft completion rates and time to publish 