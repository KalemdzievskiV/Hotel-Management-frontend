# 📝 Form Refactoring Template

## ✅ **Completed Example: Hotels New Form**

The Hotels new form (`/dashboard/hotels/new/page.tsx`) has been fully refactored and serves as the **perfect template** for all other forms.

---

## 🎯 **Pattern to Apply to Remaining Forms**

### **1. Add Imports**

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

---

### **2. Replace Card Sections**

**Before:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Title</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Fields */}
  </div>
</div>
```

**After:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Fields */}
    </div>
  </CardContent>
</Card>
```

---

### **3. Replace Input Fields**

**Before:**
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
    placeholder="Placeholder"
  />
  {errors.fieldName && <p className="mt-1 text-sm text-red-600">{errors.fieldName}</p>}
</div>
```

**After:**
```tsx
<div className="space-y-2">
  <Label htmlFor="fieldName">Field Name *</Label>
  <Input
    id="fieldName"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleChange}
    className={errors.fieldName ? 'border-red-500' : ''}
    placeholder="Placeholder"
  />
  {errors.fieldName && <p className="text-sm text-red-600">{errors.fieldName}</p>}
</div>
```

---

### **4. Replace Textarea**

**Before:**
```tsx
<textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  placeholder="Description..."
/>
```

**After:**
```tsx
<Textarea
  id="description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
  placeholder="Description..."
/>
```

---

### **5. Replace Select Dropdowns**

**Before:**
```tsx
<select
  name="fieldName"
  value={formData.fieldName}
  onChange={handleChange}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>
```

**After:**
```tsx
<Select 
  value={formData.fieldName?.toString() || ''} 
  onValueChange={(value) => setFormData(prev => ({ ...prev, fieldName: parseInt(value) }))}
>
  <SelectTrigger id="fieldName">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**Note:** For string values, use `value` directly without `parseInt()`.

---

### **6. Replace Checkboxes (if any)**

**Before:**
```tsx
<input
  type="checkbox"
  name="isActive"
  checked={formData.isActive}
  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
  className="h-4 w-4"
/>
```

**After:**
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  id="isActive"
  checked={formData.isActive}
  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
/>
```

---

### **7. Replace Form Buttons**

**Before:**
```tsx
<div className="flex gap-4">
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
</div>
```

**After:**
```tsx
<div className="flex gap-4">
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
</div>
```

---

## 📋 **Remaining Forms to Refactor**

### **Apply This Template To:**

1. **Hotels Edit** (`/dashboard/hotels/[id]/edit/page.tsx`)
   - Same structure as new form
   - Just loads existing data

2. **Rooms New** (`/dashboard/rooms/new/page.tsx`)
   - Additional fields: RoomType, RoomStatus, Short-stay options
   - Use Select for enums

3. **Rooms Edit** (`/dashboard/rooms/[id]/edit/page.tsx`)
   - Same as Rooms new + data loading

4. **Guests New** (`/dashboard/guests/new/page.tsx`)
   - Many fields (personal, address, emergency contact)
   - Group into Card sections

5. **Guests Edit** (`/dashboard/guests/[id]/edit/page.tsx`)
   - Same as Guests new + data loading

6. **Reservations New** (`/dashboard/reservations/new/page.tsx`)
   - Most complex form
   - Dynamic fields based on booking type
   - Room availability checking

---

## 🎨 **Special Cases**

### **For Enum Selects (Rooms, Reservations):**

```tsx
import { RoomType, RoomTypeLabels } from '@/types';

<Select 
  value={formData.type?.toString() || ''} 
  onValueChange={(value) => setFormData(prev => ({ ...prev, type: parseInt(value) as RoomType }))}
>
  <SelectTrigger id="type">
    <SelectValue placeholder="Select room type" />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(RoomTypeLabels).map(([key, label]) => (
      <SelectItem key={key} value={key}>
        {label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### **For Conditional Fields (Rooms Short-stay):**

```tsx
{formData.allowsShortStay && (
  <div className="space-y-2">
    <Label htmlFor="shortStayHourlyRate">Hourly Rate</Label>
    <Input
      id="shortStayHourlyRate"
      type="number"
      name="shortStayHourlyRate"
      value={formData.shortStayHourlyRate || ''}
      onChange={handleChange}
    />
  </div>
)}
```

---

## ⏱️ **Estimated Time Per Form**

- Simple forms (Hotels): **5-10 minutes**
- Medium forms (Rooms, Guests): **10-15 minutes**
- Complex forms (Reservations): **15-20 minutes**

**Total for all 6 remaining forms:** ~1-1.5 hours

---

## ✅ **Quality Checklist**

Before marking a form as complete, verify:

- [ ] All imports added
- [ ] All Card sections use `Card` + `CardHeader` + `CardTitle` + `CardContent`
- [ ] All inputs use `Input` component
- [ ] All labels use `Label` component with `htmlFor`
- [ ] All textareas use `Textarea` component
- [ ] All selects use `Select` component
- [ ] All buttons use `Button` component
- [ ] Error states preserved (red border for errors)
- [ ] Form submission works correctly
- [ ] TypeScript errors resolved

---

## 🚀 **Next Steps**

1. ✅ Hotels new form - **DONE** (template created)
2. Use this template for remaining 6 forms
3. Test each form after refactoring
4. Move to detail pages (simpler, faster)

**The Hotels new form is your perfect reference!** 🎨
