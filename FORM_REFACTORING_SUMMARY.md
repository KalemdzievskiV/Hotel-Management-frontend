# 📝 Form Pages Refactoring Summary

## Strategy

Form pages have many input fields, so we'll refactor them systematically using shadcn/ui components.

## Components to Replace

### **Before → After:**

1. **Plain inputs** → `<Input />`
2. **Plain labels** → `<Label htmlFor="field-id" />`
3. **Plain textareas** → `<Textarea />`
4. **Plain selects** → `<Select>` with `SelectTrigger`, `SelectContent`, `SelectItem`
5. **Plain buttons** → `<Button variant="default|outline" />`
6. **Card containers** → `<Card>` with `<CardHeader>`, `<CardTitle>`, `<CardContent>`

## Pattern for Input Fields

### **Before:**
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
  {errors.fieldName && <p className="text-sm text-red-600">{errors.fieldName}</p>}
</div>
```

### **After:**
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

## Pattern for Textarea

### **Before:**
```tsx
<textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
/>
```

### **After:**
```tsx
<Textarea
  id="description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  rows={3}
/>
```

## Pattern for Select

### **Before:**
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

### **After:**
```tsx
<Select 
  value={formData.stars.toString()} 
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

## Pattern for Card Sections

### **Before:**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Title</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Fields */}
  </div>
</div>
```

### **After:**
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

## Pattern for Form Buttons

### **Before:**
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
    disabled={createHotel.isPending}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    {createHotel.isPending ? 'Creating...' : 'Create Hotel'}
  </button>
</div>
```

### **After:**
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
    disabled={createHotel.isPending}
  >
    {createHotel.isPending ? 'Creating...' : 'Create Hotel'}
  </Button>
</div>
```

## Form Pages to Refactor

### **Priority Order:**
1. ✅ Hotels - new (template created)
2. ⏳ Hotels - edit
3. ⏳ Rooms - new
4. ⏳ Rooms - edit
5. ⏳ Guests - new
6. ⏳ Guests - edit
7. ⏳ Reservations - new (most complex)

## Benefits

1. **Consistency** - All forms look and behave the same
2. **Accessibility** - Built-in ARIA attributes
3. **Validation** - Better error state handling
4. **Maintainability** - Centralized component styling
5. **Type Safety** - Full TypeScript support

## Time Estimate

- Simple forms (Hotels, Guests): ~10 minutes each
- Complex forms (Rooms with short-stay, Reservations): ~15-20 minutes each
- **Total**: ~1.5-2 hours for all 7 form pages
