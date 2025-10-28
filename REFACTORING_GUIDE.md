# 🎨 shadcn/ui Refactoring Guide

## ✅ **Completed Refactoring**

### **Hotels List Page** (`/dashboard/hotels/page.tsx`)
- ✅ Button component for "Add Hotel"
- ✅ Input component for search
- ✅ Card component for search container
- ✅ Badge component for status
- ✅ Button components for actions (View, Edit, Delete)
- ✅ Dialog component for delete confirmation

---

## 📋 **Component Replacement Patterns**

### **1. Buttons**

**Before:**
```tsx
<button
  onClick={handleClick}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Click Me
</button>
```

**After:**
```tsx
<Button onClick={handleClick}>
  Click Me
</Button>
```

**Variants:**
- `variant="default"` - Primary blue button
- `variant="destructive"` - Red button for delete actions
- `variant="outline"` - Bordered button
- `variant="ghost"` - Transparent button for table actions
- `variant="secondary"` - Gray button

**Sizes:**
- `size="default"` - Normal size
- `size="sm"` - Small for table actions
- `size="lg"` - Large for emphasis
- `size="icon"` - Square icon button

---

### **2. Inputs**

**Before:**
```tsx
<input
  type="text"
  value={value}
  onChange={onChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg..."
/>
```

**After:**
```tsx
<Input
  type="text"
  value={value}
  onChange={onChange}
/>
```

---

### **3. Cards**

**Before:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

**After:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

---

### **4. Badges**

**Before:**
```tsx
<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
  Active
</span>
```

**After:**
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Inactive</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

---

### **5. Dialogs/Modals**

**Before:**
```tsx
{showDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50...">
    <div className="bg-white rounded-lg p-6...">
      <h3>Title</h3>
      <p>Description</p>
      <div className="flex gap-3">
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
)}
```

**After:**
```tsx
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
      <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### **6. Labels**

**Before:**
```tsx
<label className="block text-sm font-medium text-gray-700 mb-1">
  Field Name
</label>
```

**After:**
```tsx
<Label htmlFor="field-id">Field Name</Label>
```

---

### **7. Select Dropdowns**

**Before:**
```tsx
<select
  value={value}
  onChange={onChange}
  className="w-full px-4 py-2 border..."
>
  <option value="1">Option 1</option>
</select>
```

**After:**
```tsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### **8. Textarea**

**Before:**
```tsx
<textarea
  value={value}
  onChange={onChange}
  className="w-full px-4 py-2 border..."
  rows={3}
/>
```

**After:**
```tsx
<Textarea
  value={value}
  onChange={onChange}
  rows={3}
/>
```

---

## 🎯 **Refactoring Priority**

### **Phase 1: List Pages** (High Impact)
- ✅ `/dashboard/hotels/page.tsx` - DONE
- ⏳ `/dashboard/rooms/page.tsx`
- ⏳ `/dashboard/guests/page.tsx`
- ⏳ `/dashboard/reservations/page.tsx`

### **Phase 2: Form Pages** (Medium Impact)
- ⏳ `/dashboard/hotels/new/page.tsx`
- ⏳ `/dashboard/hotels/[id]/edit/page.tsx`
- ⏳ `/dashboard/rooms/new/page.tsx`
- ⏳ `/dashboard/rooms/[id]/edit/page.tsx`
- ⏳ `/dashboard/guests/new/page.tsx`
- ⏳ `/dashboard/guests/[id]/edit/page.tsx`
- ⏳ `/dashboard/reservations/new/page.tsx`

### **Phase 3: Detail Pages** (Low Impact)
- ⏳ `/dashboard/hotels/[id]/page.tsx`
- ⏳ `/dashboard/rooms/[id]/page.tsx`
- ⏳ `/dashboard/guests/[id]/page.tsx`
- ⏳ `/dashboard/reservations/[id]/page.tsx`

---

## 📦 **Required Imports**

Add these imports to each refactored file:

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
```

---

## ✨ **Benefits**

1. **Consistency** - Unified design system across all pages
2. **Accessibility** - Built-in ARIA attributes and keyboard navigation
3. **Maintainability** - Centralized styling, easier to update
4. **Professional Look** - Polished, modern UI components
5. **Dark Mode Ready** - Components support dark mode out of the box
6. **Type Safety** - Full TypeScript support

---

## 🚀 **Next Steps**

1. Refactor all list pages (highest visual impact)
2. Refactor form pages (better UX)
3. Refactor detail pages (consistency)
4. Test all pages for functionality
5. Fix any styling issues
6. Add dark mode toggle (optional)
