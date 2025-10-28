# ⚡ Quick Form Refactoring Guide

## Pattern to Apply to ALL Form Pages

Since Hotels New is complete, use this exact pattern for all other forms:

### **1. Add These Imports (Copy-Paste)**

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
```

### **2. Replace All Card Sections**

**Find:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Title</h2>
  <div className="grid...">
```

**Replace with:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid...">
```

**And close with:**
```tsx
    </div>
  </CardContent>
</Card>
```

### **3. Replace All Input Fields**

**Find:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Field Name *
  </label>
  <input
    type="text"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleChange}
    className={`w-full px-4 py-2 border rounded-lg ${
      errors.fieldName ? 'border-red-500' : 'border-gray-300'
    }`}
  />
  {errors.fieldName && <p className="mt-1 text-sm text-red-600">{errors.fieldName}</p>}
</div>
```

**Replace with:**
```tsx
<div className="space-y-2">
  <Label htmlFor="fieldName">Field Name *</Label>
  <Input
    id="fieldName"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleChange}
    className={errors.fieldName ? 'border-red-500' : ''}
  />
  {errors.fieldName && <p className="text-sm text-red-600">{errors.fieldName}</p>}
</div>
```

### **4. Replace Textareas**

**Find:**
```tsx
<textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
/>
```

**Replace with:**
```tsx
<Textarea
  id="description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
/>
```

### **5. Replace Select Dropdowns**

**Find:**
```tsx
<select
  name="stars"
  value={formData.stars}
  onChange={handleChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="1">1 Star</option>
  <option value="2">2 Stars</option>
</select>
```

**Replace with:**
```tsx
<Select 
  value={formData.stars?.toString() || '3'} 
  onValueChange={(value) => setFormData(prev => ({ ...prev, stars: parseInt(value) }))}
>
  <SelectTrigger id="stars">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">1 Star</SelectItem>
    <SelectItem value="2">2 Stars</SelectItem>
  </SelectContent>
</Select>
```

### **6. Replace Form Buttons**

**Find:**
```tsx
<button
  type="button"
  onClick={() => router.back()}
  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
>
  Cancel
</button>
<button
  type="submit"
  disabled={mutation.isPending}
  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  {mutation.isPending ? 'Saving...' : 'Save'}
</button>
```

**Replace with:**
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => router.back()}
>
  Cancel
</Button>
<Button
  type="submit"
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Saving...' : 'Save'}
</Button>
```

---

## ⚡ Forms to Refactor (Priority Order)

1. ✅ Hotels New - DONE (template)
2. ⏳ Hotels Edit - Same as Hotels New
3. ⏳ Rooms New - Similar + short-stay fields
4. ⏳ Rooms Edit - Same as Rooms New
5. ⏳ Guests New - More fields, same pattern
6. ⏳ Guests Edit - Same as Guests New
7. ⏳ Reservations New - Most complex

---

## 🎯 Time Estimate

- Hotels Edit: 5 min (identical to New)
- Rooms New/Edit: 10 min each (extra fields)
- Guests New/Edit: 10 min each (many fields)
- Reservations New: 15 min (complex)

**Total: ~1 hour**

---

## ✅ Checklist Per Form

- [ ] Add imports
- [ ] Replace all Card sections
- [ ] Replace all Input fields
- [ ] Replace all Textarea fields
- [ ] Replace all Select dropdowns
- [ ] Replace all Buttons
- [ ] Test form submission
- [ ] Verify error states

---

**Reference:** `c:\Users\vlada\RiderProjects\hotel-management-frontend\app\dashboard\hotels\new\page.tsx`
