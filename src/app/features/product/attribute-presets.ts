export interface AttributePreset {
  key: string;
  label: string;
  values: string[];
}

export const ATTRIBUTE_PRESETS: AttributePreset[] = [
  {
    key: 'color',
    label: 'Màu',
    values: [
      'Đen',
      'Trắng',
      'Be',
      'Xám',
      'Xám tro',
      'Navy',
      'Xanh nhạt',
      'Xanh navy',
      'Xanh rêu',
      'Olive',
      'Hồng pastel',
      'Hồng',
      'Đỏ',
      'Đỏ đô',
      'Vàng pastel',
      'Camel',
    ],
  },
  {
    key: 'size',
    label: 'Size (chữ)',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    key: 'size_number',
    label: 'Size (số)',
    values: ['26', '27', '28', '29', '30', '31', '32', '33', '34', '36'],
  },
  {
    key: 'size_age',
    label: 'Size (tuổi)',
    values: ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12'],
  },
  {
    key: 'wash',
    label: 'Wash',
    values: ['Xanh sáng', 'Xanh đậm', 'Xanh nhạt', 'Đen', 'Trắng', 'Raw indigo', 'One-wash'],
  },
  {
    key: 'pattern',
    label: 'Hoạ tiết',
    values: ['Trơn', 'Ca rô đỏ', 'Ca rô xanh', 'Ca rô đen', 'Hoa nhí', 'Sọc', 'Chấm bi'],
  },
  {
    key: 'material',
    label: 'Chất liệu',
    values: ['Cotton', 'Linen', 'Denim', 'Polyester', 'Len', 'Satin', 'Da PU', 'Da bò'],
  },
  {
    key: 'length',
    label: 'Chiều dài (thắt lưng/quần)',
    values: ['90cm', '100cm', '110cm', '120cm'],
  },
];

export function findPreset(key: string): AttributePreset | undefined {
  return ATTRIBUTE_PRESETS.find((p) => p.key === key);
}
