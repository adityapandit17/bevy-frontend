# Expense Tracker

A comprehensive personal expense tracking application built with Next.js and TypeScript.

## Features

### Core Functionality
- ✅ Add, edit, and delete expenses
- ✅ Categorize expenses (Office, Meals, Transportation, Software, etc.)
- ✅ Track payment methods (Credit Card, Cash, Bank Transfer, etc.)
- ✅ Add tags for better organization
- ✅ Date-based expense tracking

### Advanced Features
- ✅ Real-time search across titles, descriptions, and tags
- ✅ Advanced filtering by category, month, payment method, and amount range
- ✅ Expense summary with total, average, monthly trends, and highest expense
- ✅ Category-wise expense breakdown
- ✅ Month-over-month comparison
- ✅ Responsive design for mobile and desktop

### UI Components
- ✅ Modern, clean interface using shadcn/ui components
- ✅ Interactive forms with validation
- ✅ Tabbed interface (List, Categories, Analytics)
- ✅ Loading states and skeleton screens
- ✅ Color-coded categories with icons

## Usage

Navigate to `/expense-tracker` to access the expense tracking interface.

### Adding Expenses
1. Click the "Add Expense" button
2. Fill in the required fields (Title, Amount, Category, Date)
3. Optionally add description, payment method, and tags
4. Click "Add Expense" to save

### Filtering Expenses
- Use the search bar to find expenses by title, description, or tags
- Filter by category, month, payment method
- Set minimum and maximum amount ranges
- Active filters are displayed as badges

### Managing Expenses
- Click the edit icon to modify an expense
- Click the delete icon to remove an expense
- View expense details in the list view

## Data Structure

Each expense contains:
```typescript
interface Expense {
  id: number
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
  tags: string[]
  receipt?: string | null
}
```

## Categories

- **Office**: Office supplies, stationery, equipment
- **Meals**: Food, drinks, dining out
- **Transportation**: Uber, taxi, fuel, public transport
- **Software**: Software licenses, subscriptions
- **Travel**: Business travel, accommodation
- **Entertainment**: Movies, games, leisure activities
- **Healthcare**: Medical expenses, pharmacy
- **Education**: Courses, books, training
- **Utilities**: Bills, internet, phone
- **Other**: Miscellaneous expenses

## Payment Methods

- Credit Card
- Debit Card
- Cash
- Bank Transfer
- Digital Wallet

## Future Enhancements

- [ ] Receipt upload and storage
- [ ] Export to CSV/PDF
- [ ] Budget tracking and alerts
- [ ] Recurring expense templates
- [ ] Expense analytics and charts
- [ ] Multi-currency support
- [ ] Expense sharing and collaboration
- [ ] Mobile app integration
- [ ] Bank account integration
- [ ] Expense approval workflows

## Technical Details

- Built with Next.js 14 and TypeScript
- Uses shadcn/ui component library
- Responsive design with Tailwind CSS
- Client-side state management with React hooks
- Mock data for demonstration (ready for backend integration)

## Backend Integration

The expense tracker is designed to be easily integrated with a backend API. The current implementation uses mock data but includes all necessary interfaces and data structures for seamless backend integration.

Key integration points:
- Expense CRUD operations
- User authentication and authorization
- File upload for receipts
- Data export functionality
- Real-time synchronization
